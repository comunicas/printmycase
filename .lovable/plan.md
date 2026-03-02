

# Pagina de Produto - Template

## Visao Geral

Criar uma pagina de produto (`/product/:id`) que serve como template para todos os produtos da loja. A pagina atual do editor de customizacao (`/customize/:id`) sera acessada a partir desta pagina via botao "Customizar".

## Estrutura da Pagina

```text
+-- Header (mesmo da Index, com botao voltar funcional) -----+
|  <- Voltar    Case Studio                          Ajuda    |
+-------------------------------------------------------------+
|                                                             |
|  +-- Galeria de Imagens --+  +-- Info do Produto ---------+ |
|  |                        |  |                             | |
|  |   [Imagem principal]   |  |  Capa iPhone 15 Pro Max    | |
|  |                        |  |  ★★★★★ (42 avaliacoes)     | |
|  |  [thumb] [thumb] [thumb]  |                             | |
|  |                        |  |  R$ 79,90                   | |
|  +------------------------+  |                             | |
|                              |  [Selecao de cor]           | |
|                              |  ● Preto ● Branco ● Azul   | |
|                              |                             | |
|                              |  [Customizar Minha Capa →]  | |
|                              |  [Adicionar ao Carrinho]    | |
|                              +-----------------------------+ |
|                                                             |
|  +-- Tabs: Descricao | Especificacoes | Avaliacoes -------+ |
|  |                                                         | |
|  |  Descricao do produto com detalhes sobre material,      | |
|  |  protecao, compatibilidade, etc.                        | |
|  |                                                         | |
|  +-- Especificacoes: Material, Peso, Dimensoes, etc. -----+ |
|                                                             |
+-------------------------------------------------------------+
```

## Componentes a Criar

### 1. `src/pages/Product.tsx`
Pagina principal do produto com layout responsivo (imagem a esquerda, info a direita em desktop; empilhado em mobile). Usa dados mockados de produto por enquanto. Contem:
- Galeria de imagens com thumbnail selector
- Bloco de informacoes (nome, preco, avaliacao, cores)
- Botao "Customizar Minha Capa" que navega para `/customize/:id`
- Botao "Adicionar ao Carrinho"
- Tabs com Descricao, Especificacoes e Avaliacoes

### 2. `src/components/ProductGallery.tsx`
Galeria de imagens do produto com imagem principal e thumbnails clicaveis. Exibe imagens de placeholder do produto (frente, costas, lateral da capa).

### 3. `src/components/ProductInfo.tsx`
Bloco com nome, preco, avaliacao em estrelas, seletor de cor e botoes de acao. O botao "Customizar" usa `useNavigate` para ir ao editor.

### 4. `src/components/ProductDetails.tsx`
Componente com Tabs (Descricao, Especificacoes, Avaliacoes) usando os mesmos componentes Radix Tabs ja existentes. Especificacoes em formato de tabela com Material, Peso, Dimensoes, Compatibilidade, etc.

### 5. `src/data/products.ts`
Arquivo de dados mockados com interface `Product` contendo: id, nome, preco, descricao, imagens, cores disponiveis, especificacoes, avaliacao media e quantidade de reviews. Servira como template ate haver backend.

## Alteracoes em Arquivos Existentes

### `src/App.tsx`
- Adicionar rota `/product/:id` para a pagina de produto
- Mover a rota atual `/` para `/customize/:id` (editor de customizacao)
- Rota `/` passa a ser a pagina de produto (ou redireciona para um produto default)

### `src/pages/Index.tsx`
- Renomear para `src/pages/Customize.tsx` para refletir seu papel real (editor de customizacao)
- Ativar o botao "Voltar" no header para navegar de volta a pagina do produto

## Fluxo de Navegacao

```text
/product/:id  →  [Customizar]  →  /customize/:id
                                      ↑ [Voltar]
```

## Detalhes Tecnicos

- Dados mockados em `src/data/products.ts` com tipagem TypeScript
- Navegacao via `react-router-dom` com `useParams` e `useNavigate`
- Layout responsivo com Tailwind (`flex-col` mobile, `lg:flex-row` desktop)
- Reutiliza componentes UI existentes: `Card`, `Button`, `Tabs`, `Badge`, `Separator`
- Cores do produto como badges clicaveis com borda de selecao
- Preco formatado em BRL com `Intl.NumberFormat`

