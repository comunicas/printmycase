

## Vitrine Instagram com Embeds Nativos

### Abordagem

Usar o embed nativo do Instagram (o HTML que você cola). O admin cadastra apenas a **URL do post** — o front monta o embed automaticamente usando o script `embed.js` do Instagram. Zero API, zero token, zero thumbnail manual.

### Fase 1 — Migration: tabela `instagram_posts`

```sql
CREATE TABLE public.instagram_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_url text NOT NULL,
  caption text DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.instagram_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage instagram posts"
  ON public.instagram_posts FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active instagram posts"
  ON public.instagram_posts FOR SELECT TO public
  USING (active = true);
```

### Fase 2 — Admin: `InstagramPostsManager`

- CRUD simples: o admin cola apenas a **URL do post** (ex: `https://www.instagram.com/reel/DRqAUPDEUCV/`)
- Campos: URL do post, legenda opcional, ordem, ativo/inativo
- Preview do embed dentro do dialog (opcional)

### Fase 3 — Registrar no Admin

- Adicionar `"instagram-posts"` ao `AdminSection` no `AdminSidebar.tsx` (grupo "Conteúdo", ícone `Instagram` do Lucide)
- Mapear no `Admin.tsx`

### Fase 4 — Componente `InstagramShowcase`

- Busca posts ativos ordenados por `sort_order`
- Para cada post, renderiza um `blockquote` embed nativo do Instagram usando a URL
- Após renderizar, chama `window.instgrm.Embeds.process()` para ativar os embeds
- Carrega `//www.instagram.com/embed.js` uma única vez via script tag dinâmico
- Layout: scroll horizontal no mobile, grid 3 colunas no desktop
- Se não houver posts, a seção não renderiza
- Heading: "Siga a PrintMyCase no Instagram"

### Fase 5 — Landing Page

Inserir `<InstagramShowcase />` entre `<StoreLocator />` e o bloco de Testimonials.

### Como funciona o embed

A URL `https://www.instagram.com/reel/DRqAUPDEUCV/` vira:

```html
<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/reel/DRqAUPDEUCV/">
</blockquote>
```

O script `embed.js` do Instagram transforma automaticamente em um iframe interativo com preview, player de vídeo, likes, etc.

### Resultado

- Admin cola só o link do Instagram — nada mais
- Landing exibe embeds nativos e interativos entre Lojas e Depoimentos
- Zero configuração de API/tokens
- Responsivo nativo (Instagram controla o iframe)

