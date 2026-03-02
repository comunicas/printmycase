

# Expandir Catalogo de Produtos com Todos os Modelos

## O que sera feito

Expandir o arquivo `src/data/products.ts` com todos os 20 modelos de iPhone da planilha, cada um com preco R$ 69,90 e imagens genericas de mockup de capa preta (usando URLs de imagens gratuitas de mockup de capas de celular).

## Produtos a adicionar (20 modelos)

Baseado na planilha:
- iPhone 17, 17 Air, 17 Pro, 17 Pro Max
- iPhone Xs Max, X/Xs, Xr, X
- iPhone SE 3
- iPhone 11 Pro Max, 11 Pro, 11
- iPhone 7/8 Plus, 7/8, 7 Plus, 7

O produto existente (iPhone 15 Pro Max) sera mantido e atualizado para o preco de 69.90.

## Estrutura de cada produto

Cada produto tera:
- `id`: slug unico (ex: `iphone-17-pro-max`)
- `name`: "Capa iPhone 17 Pro Max"
- `price`: 69.90
- `description`: descricao generica da capa personalizada
- `images`: 3 imagens genericas de mockup (URLs de imagens de capas pretas)
- `colors`: mesmas opcoes de cor para todos (Preto, Branco, Azul, Vermelho)
- `specs`: especificacoes adaptadas por modelo (dimensoes, compatibilidade)
- `rating`: valores variados entre 4.5-4.9
- `reviewCount`: valores variados

## Rota padrao

Atualizar a rota `/` em `src/App.tsx` para redirecionar para `/product/iphone-17-pro-max` (modelo mais recente).

## Imagens

Usaremos imagens de mockup genericas hospedadas em servicos gratuitos (ex: unsplash/pexels) mostrando capas de celular pretas. Caso nao carreguem, o placeholder SVG atual sera o fallback.

## Arquivos modificados

1. **`src/data/products.ts`** -- Expandir array `products` com 20 modelos, manter interfaces e funcoes utilitarias
2. **`src/App.tsx`** -- Atualizar redirect padrao para o modelo mais recente

