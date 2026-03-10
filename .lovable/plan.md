

## Plano Revisado: Base de Conhecimento + FAQ Integrado

### Resumo

Criar uma Central de Ajuda (`/ajuda`) com artigos organizados por categoria. O FAQ atual da tabela `faqs` será migrado para dentro da base de conhecimento como artigos. Na landing page, as perguntas em destaque continuam aparecendo no accordion, mas com link para a central completa. O admin unifica a gestão de tudo.

### 1. Banco de Dados

**Tabela `kb_categories`** (nova):
- `id` uuid PK, `name` text, `slug` text unique, `icon` text nullable, `description` text nullable, `sort_order` int default 0, `active` bool default true, `created_at` timestamptz

**Tabela `kb_articles`** (nova):
- `id` uuid PK, `category_id` uuid FK → kb_categories, `title` text, `slug` text unique, `content` text (markdown), `sort_order` int default 0, `active` bool default true, `created_at` timestamptz, `updated_at` timestamptz

**Tabela `faqs`** — adicionar coluna:
- `featured` boolean default false — controla quais aparecem na landing
- `kb_article_id` uuid nullable FK → kb_articles — vincula FAQ a um artigo da base (opcional, para "leia mais")

**RLS**: SELECT público para registros ativos; ALL para admins (mesmo padrão das tabelas existentes).

**Migração de dados**: Criar uma categoria "Perguntas Frequentes" automaticamente e inserir as FAQs existentes como artigos nessa categoria.

### 2. Páginas Frontend

| Rota | Página | Descrição |
|---|---|---|
| `/ajuda` | `KnowledgeBase.tsx` | Grid de categorias com ícone, nome, descrição e contagem de artigos |
| `/ajuda/:categorySlug` | `KbCategory.tsx` | Lista de artigos da categoria com breadcrumb |
| `/ajuda/:categorySlug/:articleSlug` | `KbArticle.tsx` | Artigo individual com markdown renderizado (reutilizar parser do LegalDocument) |

### 3. Alterações no FAQ da Landing

- `FaqSection.tsx`: filtrar por `featured = true`, limitar a 5 itens
- Adicionar botão "Ver Central de Ajuda →" linkando para `/ajuda`

### 4. Painel Admin — Reestruturação

Substituir a aba "FAQ" por uma aba **"Base de Conhecimento"** que contém:

- **Sub-aba Categorias** (`KbCategoriesManager`): CRUD de categorias (nome, slug auto-gerado, ícone, descrição, ordem, ativo)
- **Sub-aba Artigos** (`KbArticlesManager`): CRUD de artigos com editor markdown, seletor de categoria, ordem, ativo
- **Sub-aba FAQ Home** (FaqManager atualizado): lista as FAQs existentes com toggle `featured` para controlar quais aparecem na landing. Cada FAQ pode ser vinculada a um artigo da base para "leia mais"

O FaqManager continua gerindo a tabela `faqs`, mas agora com o campo `featured` e link opcional para artigo.

### 5. Rotas (App.tsx)

Adicionar:
```
/ajuda → KnowledgeBase
/ajuda/:categorySlug → KbCategory  
/ajuda/:categorySlug/:articleSlug → KbArticle
```

### 6. Arquivos

| Ação | Arquivo |
|---|---|
| Migration | Criar `kb_categories`, `kb_articles`, alterar `faqs` (add `featured`, `kb_article_id`) |
| Criar | `src/pages/KnowledgeBase.tsx` |
| Criar | `src/pages/KbCategory.tsx` |
| Criar | `src/pages/KbArticle.tsx` |
| Criar | `src/components/admin/KbCategoriesManager.tsx` |
| Criar | `src/components/admin/KbArticlesManager.tsx` |
| Editar | `src/components/FaqSection.tsx` — filtrar `featured`, adicionar link `/ajuda` |
| Editar | `src/components/admin/FaqManager.tsx` — toggle featured + link para artigo |
| Editar | `src/pages/Admin.tsx` — substituir aba FAQ por "Base de Conhecimento" com sub-abas |
| Editar | `src/App.tsx` — novas rotas |
| Editar | `src/pages/Landing.tsx` — link no footer para `/ajuda` |

