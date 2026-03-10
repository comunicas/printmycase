

## Vincular FAQs a Artigos da Base de Conhecimento

### Problema
O campo `kb_article_id` já existe na tabela `faqs`, mas o FaqManager não permite selecioná-lo. O FaqSection também não exibe o link "Leia mais" quando há um artigo vinculado.

### Alterações

**1. `src/components/admin/FaqManager.tsx`**
- Adicionar `kb_article_id` à interface `Faq`
- Carregar lista de artigos (`kb_articles`) ao montar o componente para popular um `<select>`
- Adicionar campo select no dialog de criação/edição para escolher artigo vinculado (opcional)
- Incluir `kb_article_id` nas operações de insert/update
- Exibir indicador visual (ícone link) nos FAQs que têm artigo vinculado

**2. `src/components/FaqSection.tsx`**
- Incluir `kb_article_id` no select da query
- Fazer join com `kb_articles` para obter slug e `kb_categories` para obter o slug da categoria
- Renderizar link "Leia mais" abaixo da resposta quando `kb_article_id` estiver preenchido, apontando para `/ajuda/{category_slug}/{article_slug}`

### Sem alterações no banco
O campo `kb_article_id` já existe na tabela `faqs`. Nenhuma migração necessária.

