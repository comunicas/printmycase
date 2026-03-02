
# Pagina de Catalogo de Produtos

## O que sera feito

Criar uma nova pagina `/catalog` que lista todos os 20 modelos de capas disponiveis em um grid de cards clicaveis. Cada card mostra a imagem do produto, nome, preco e avaliacao. Clicar em um card navega para `/product/:id`.

## Estrutura Visual

```text
+-- Header ---------------------------------------------------+
|  Case Studio                                                 |
+--------------------------------------------------------------+
|                                                              |
|  Nossos Modelos              [20 capas disponiveis]          |
|                                                              |
|  +----------+  +----------+  +----------+  +----------+     |
|  | [imagem] |  | [imagem] |  | [imagem] |  | [imagem] |     |
|  | iPhone   |  | iPhone   |  | iPhone   |  | iPhone   |     |
|  | 17 Pro   |  | 17 Pro   |  | 17 Air   |  | 17       |     |
|  | Max      |  |          |  |          |  |          |     |
|  | R$69,90  |  | R$69,90  |  | R$69,90  |  | R$69,90  |     |
|  | ★★★★★    |  | ★★★★★    |  | ★★★★★    |  | ★★★★★    |     |
|  +----------+  +----------+  +----------+  +----------+     |
|  ...mais cards...                                            |
+--------------------------------------------------------------+
```

## Arquivos a criar

### 1. `src/pages/Catalog.tsx`
- Header simples com titulo "Case Studio"
- Subtitulo "Nossos Modelos" com contagem de produtos
- Grid responsivo: 2 colunas mobile, 3 tablet, 4 desktop
- Cada card usa componente `Card` existente com:
  - Imagem do produto (primeira do array `images`)
  - Nome do produto
  - Preco formatado em BRL
  - Estrelas de avaliacao e contagem de reviews
- `useNavigate` para navegar ao clicar no card

## Arquivos a modificar

### 2. `src/App.tsx`
- Adicionar rota `/catalog` para a pagina de catalogo
- Alterar redirect da rota `/` de `/product/iphone-17-pro-max` para `/catalog`

## Detalhes tecnicos

- Importa `products` e `formatPrice` de `src/data/products.ts`
- Reutiliza componentes `Card`, `CardContent` ja existentes
- Grid com classes Tailwind: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4`
- Cards com `cursor-pointer` e `hover:shadow-md` para feedback visual
- Estrelas com icone `Star` do lucide-react (mesmo padrao do `ProductInfo`)
