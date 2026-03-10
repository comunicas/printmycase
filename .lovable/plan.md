

## Busca na Central de Ajuda + UX do Artigo

### 1. Busca global em `/ajuda` (`KnowledgeBase.tsx`)

- Adicionar campo de busca (Input com ícone Search) abaixo do subtítulo
- Ao digitar (debounce ~300ms), buscar artigos via `ilike` no título e conteúdo da tabela `kb_articles`
- Quando há termo de busca, substituir o grid de categorias por uma lista de resultados (título + nome da categoria + trecho do conteúdo com highlight)
- Cada resultado linka para `/ajuda/{category_slug}/{article_slug}` — precisa fazer join com `kb_categories` para obter o slug
- Estado vazio: "Nenhum resultado para [termo]"
- Limpar busca: botão X no input, volta ao grid de categorias

### 2. UX melhorada do artigo (`KbArticle.tsx`)

- Adicionar título `<h1>` acima do conteúdo (atualmente o título só aparece no breadcrumb)
- Adicionar metadados: categoria com link e data de atualização
- Melhorar renderização Markdown: suporte a `**bold**` inline (não só linhas inteiras), links `[text](url)`
- Adicionar botão "Voltar à categoria" no final do artigo
- Card container com padding adequado em vez de conteúdo solto

### Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `src/pages/KnowledgeBase.tsx` | Input de busca, query de artigos com join, renderização condicional busca vs categorias |
| `src/pages/KbArticle.tsx` | Título H1, metadados (categoria + data), melhor parser Markdown, botão voltar |

Sem alterações no banco de dados.

