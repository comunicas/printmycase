
User quer ItemList JSON-LD na seção "Designs semelhantes" do DesignPage para reforçar SEO de links internos.

## Plano

Adicionar um schema `ItemList` ao JSON-LD já existente no `useEffect` de SEO do `DesignPage.tsx` (linhas ~117-156), incluído no array `@graph` ao lado de `Product` e `BreadcrumbList`.

### Conteúdo do ItemList

```json
{
  "@type": "ItemList",
  "name": "Designs semelhantes em {collection.name}",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "url": "https://studio.printmycase.com.br/colecao/{collectionSlug}/{d.slug}",
      "name": "{d.name}",
      "image": "{d.image_url}"
    },
    ...
  ]
}
```

### Mudanças

**`src/pages/DesignPage.tsx`** — uma única alteração no useEffect de SEO:
1. Calcular `similarDesigns = siblingDesigns.filter(d => d.id !== design.id).slice(0, 8)` antes de montar o JSON-LD
2. Adicionar bloco `ItemList` ao `@graph` apenas se `similarDesigns.length > 0`
3. Incluir `siblingDesigns` e `collection?.name` nas dependências do `useEffect`

### Fora de escopo
- Não criar componente/helper separado (uma chamada só, fica inline)
- Não alterar UI da seção (já implementada)
- Não tocar Product/Breadcrumb existentes

### Arquivos
- `src/pages/DesignPage.tsx` — ~10 linhas adicionadas no useEffect de SEO
