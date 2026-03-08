

## Correção de Hierarquia de Headings — Página de Produto

### Problema

A página de produto tem apenas `<h1>` (nome do produto em `ProductInfo`). Não existe nenhum `<h2>` — as seções "Descrição" e "Especificações" usam apenas texto nos TabsTrigger sem heading semântico. Isso prejudica SEO porque crawlers não conseguem identificar a estrutura de conteúdo da página.

Hierarquia atual:
```text
H1: Motorola Edge 50
(sem H2)
```

### Alterações

**`src/components/ProductInfo.tsx`**
1. Adicionar `<h2>` para o preço com classe `sr-only` implícita no contexto (ou visível como label "Preço")
2. Manter H1 como está — correto

**`src/components/ProductDetails.tsx`**
3. Adicionar `<h2>` visível acima das tabs: "Detalhes do Produto"
4. Dentro de cada TabsContent, usar `<h3>` antes do conteúdo: "Descrição" e "Especificações Técnicas" — isso dá estrutura semântica ao conteúdo que hoje só existe como label de tab

**`src/components/ProductGallery.tsx`**
5. Adicionar `<h2 className="sr-only">` com texto "Galeria de imagens" para acessibilidade e SEO

Hierarquia resultante:
```text
H1: Motorola Edge 50
  H2: Galeria de imagens (sr-only)
  H2: Detalhes do Produto
    H3: Descrição
    H3: Especificações Técnicas
```

### Arquivos alterados
- `src/components/ProductDetails.tsx` — H2 + H3 semânticos
- `src/components/ProductGallery.tsx` — H2 sr-only
- `src/components/ProductInfo.tsx` — sem mudança (H1 já correto)

