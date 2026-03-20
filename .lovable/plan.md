

## Redirecionar todos os links de produto para customização

### Problema
O `ProductCard` tem dois comportamentos: clicar no card leva para `/product/{slug}` (página de produto/SEO) e o botão "Customizar" leva para `/customize/{slug}`. Para a experiência do app, queremos que **todo clique** leve direto para `/customize/{slug}`, reduzindo navegação desnecessária. A página `/product/{slug}` continua existindo para SEO (acesso orgânico), mas não é linkada internamente.

### Alteração

**1. `src/components/ProductCard.tsx`**
- Alterar o `onClick` do Card de `/product/${slug}` para `/customize/${slug}`
- Remover o botão "Customizar" separado (agora redundante — o card inteiro já leva para customizar)
- Resultado: card mais limpo, um único clique = customizar

### Impacto
- Landing (vitrine), Catalog, Collections — todos usam `ProductCard`, então todos passam a levar direto para customização
- A rota `/product/:id` permanece no `App.tsx` para tráfego orgânico/SEO
- Nenhuma outra alteração necessária

