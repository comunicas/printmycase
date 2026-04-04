

## Instagram, Waze e SEO Local para Lojas

### Visão geral
Adicionar campos `instagram_url` e `slug` à tabela `stores`, implementar links de Instagram e "Como Chegar" (Waze) em cada card de loja, e injetar JSON-LD `LocalBusiness` para SEO local.

### Fase 1 — Migration: novos campos

```sql
ALTER TABLE public.stores
  ADD COLUMN instagram_url text,
  ADD COLUMN slug text;
```

Depois, popular os slugs existentes via INSERT tool (ex: `capinha-personalizada-shopping-center-3-sao-paulo`).

### Fase 2 — Admin: campos no dialog (`StoresManager.tsx`)

- Adicionar campos "Instagram URL" e "Slug (SEO)" no dialog de criação/edição
- Auto-gerar slug a partir do nome + cidade quando vazio

### Fase 3 — StoreLocator: links de ação + SEO

**UI nos cards de loja:**
- Botão/ícone Instagram (abre perfil em nova aba) — só aparece se `instagram_url` preenchido
- Botão "Como Chegar" que abre Waze: `https://waze.com/ul?ll={lat},{lng}&navigate=yes`
- Ambos discretos, ao lado do endereço, seguindo o estilo clean atual

**JSON-LD `LocalBusiness`** injetado via `useEffect`:
```json
{
  "@context": "https://schema.org",
  "@type": "Store",
  "name": "PrintMyCase – Shopping Center 3",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Av. Paulista, 2064",
    "addressLocality": "São Paulo",
    "addressRegion": "SP",
    "addressCountry": "BR"
  },
  "geo": { "@type": "GeoCoordinates", "latitude": -23.5558, "longitude": -46.6621 },
  "url": "https://studio.printmycase.com.br/#loja-shopping-center-3",
  "sameAs": ["https://instagram.com/printmycase"],
  "image": "https://studio.printmycase.com.br/og-image.png",
  "parentOrganization": { "@type": "Organization", "name": "PrintMyCase" }
}
```

**Semântica HTML:**
- Usar `<article>` com `itemscope itemtype="https://schema.org/Store"` em cada card
- `<address>` tag para endereços
- `aria-label` nos botões de ação

### Fase 4 — Título e copy SEO

- H2: "Lojas PrintMyCase — Capinhas Personalizadas em {N} Shopping Centers"
- Subtítulo: "Encontre a loja mais perto de você. Capinhas personalizadas com IA em shopping centers de São Paulo e Minas Gerais."
- Ambos ricos em palavras-chave locais para capturar buscas tipo "capinha personalizada shopping paulista"

### Arquivos editados
1. **Migration SQL** — `ALTER TABLE stores ADD COLUMN instagram_url, slug`
2. **`src/components/admin/StoresManager.tsx`** — campos instagram_url e slug no dialog
3. **`src/components/StoreLocator.tsx`** — links Waze/Instagram, JSON-LD, semântica HTML, copy SEO
4. **`src/integrations/supabase/types.ts`** — atualizado automaticamente

### Resultado
- Cada card de loja terá botão "Como Chegar" (Waze) e ícone Instagram
- Google indexa cada loja como `LocalBusiness` com coordenadas e endereço estruturado
- Buscas locais como "capinha personalizada shopping center 3" terão rich results
- Admin pode gerenciar Instagram URL e slug SEO por loja

