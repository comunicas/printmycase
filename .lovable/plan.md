

## Admin: Gerenciamento de Gerações de Usuários + Aprovação Pública

### Contexto

A tabela `user_ai_generations` já existe com RLS para admin (`has_role`). O admin precisa de uma interface para ver TODAS as gerações de todos os usuários, aprovar imagens para exibição pública (ex: galeria na home), e gerenciar (deletar).

### Alterações

**1. Migração — Adicionar coluna `public` à tabela `user_ai_generations`**

```sql
ALTER TABLE public.user_ai_generations ADD COLUMN public boolean NOT NULL DEFAULT false;

-- Qualquer pessoa pode ver gerações públicas (para exibir na home)
CREATE POLICY "Anyone can view public generations"
  ON public.user_ai_generations FOR SELECT TO public
  USING (public = true);
```

**2. Novo componente `src/components/admin/UserGenerationsManager.tsx`**

- Lista todas as gerações de todos os usuários (query admin via RLS)
- Grid de cards com: thumbnail, tipo (filtro/upscale/original), nome do filtro, data, user_id truncado
- Toggle "Público" por imagem (switch que faz update `public = true/false`)
- Botão deletar (remove registro + arquivo do storage)
- Filtros: por tipo (filter/upscale/original), por status público/privado
- Infinite scroll (mesmo padrão do `AiGenerationsManager`)
- Lightbox para ver imagem em tamanho completo

**3. Atualizar `src/pages/Admin.tsx`**

- Adicionar nova sub-tab "Gerações Usuários" dentro da tab "Galeria" (ao lado de "Ilustrativas" e "Gerações")
- Import e render do `UserGenerationsManager`

**4. Landing/Home — Exibir gerações públicas (opcional/futuro)**

- Não implementado agora, mas a coluna `public` + policy SELECT pública prepara o terreno

### Arquivos afetados

| Arquivo | Alteração |
|---------|-----------|
| Migração SQL | `public` boolean + policy SELECT pública |
| `src/components/admin/UserGenerationsManager.tsx` | Novo componente CRUD admin |
| `src/pages/Admin.tsx` | Nova sub-tab "Gerações Usuários" |

