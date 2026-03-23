

## Adicionar categorias aos filtros IA

### Visão geral
Criar tabela `ai_filter_categories` com CRUD completo no admin, adicionar `category_id` aos filtros existentes, e agrupar filtros por categoria na UI de customização.

### 1. Migração SQL

```sql
-- Tabela de categorias
CREATE TABLE public.ai_filter_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_filter_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage filter categories" ON public.ai_filter_categories
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin')) WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active filter categories" ON public.ai_filter_categories
  FOR SELECT TO public USING (active = true);

-- Inserir categorias iniciais
INSERT INTO public.ai_filter_categories (name, sort_order) VALUES
  ('Estilo', 1),
  ('Qualidade', 2);

-- Adicionar FK na tabela ai_filters
ALTER TABLE public.ai_filters ADD COLUMN category_id uuid REFERENCES public.ai_filter_categories(id) ON DELETE SET NULL;
```

### 2. Admin — CRUD de categorias

**Novo arquivo `src/components/admin/AiFilterCategoriesManager.tsx`**
- Lista com reordenação (ChevronUp/Down), toggle ativo/inativo, editar, excluir
- Dialog para criar/editar (campo: nome)
- Mesmo padrão visual dos outros managers (CollectionsManager, etc.)

### 3. Admin — Filtros com seletor de categoria

**`src/components/admin/AiFiltersManager.tsx`**
- Carregar categorias no mount
- Adicionar select de categoria no dialog de criar/editar filtro
- Mostrar nome da categoria no card do filtro na lista

### 4. Admin page — nova tab

**`src/pages/Admin.tsx`**
- Adicionar tab "Categorias Filtros" ou incluir o manager de categorias dentro da tab "Filtros IA" como sub-seção

### 5. Frontend — Agrupar filtros por categoria

**`src/lib/customize-types.ts`**
- Adicionar `category_id: string | null` ao tipo `AiFilter`

**`src/hooks/useCustomize.tsx`**
- Incluir `category_id` no select dos filtros
- Carregar categorias ativas (nova query)
- Expor `filterCategories` no retorno do hook

**`src/components/customize/AiFiltersList.tsx`**
- Receber `categories` como prop
- Agrupar filtros por `category_id` e renderizar com header de categoria
- Filtros sem categoria aparecem no final

**`src/components/customize/ImageControls.tsx`**
- Passar `categories` para `AiFiltersList`

### Arquivos afetados
| Arquivo | Alteração |
|---------|-----------|
| Migração SQL | Nova tabela + FK |
| `src/components/admin/AiFilterCategoriesManager.tsx` | Novo — CRUD categorias |
| `src/components/admin/AiFiltersManager.tsx` | Select de categoria |
| `src/pages/Admin.tsx` | Sub-seção ou tab de categorias |
| `src/lib/customize-types.ts` | `category_id` no tipo |
| `src/hooks/useCustomize.tsx` | Select + query categorias |
| `src/components/customize/AiFiltersList.tsx` | Agrupamento visual |
| `src/components/customize/ImageControls.tsx` | Props passthrough |

