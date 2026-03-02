

# Cadastro em massa de produtos no banco de dados

## Resumo
Inserir 73 produtos na tabela `products` organizados por fabricante: Apple (26), Samsung (33), Xiaomi (10) e Motorola (4).

## Dados padrao para todos os produtos

| Campo | Valor |
|---|---|
| price_cents | 6990 (R$ 69,90) |
| description | "Capa premium de policarbonato rigido com acabamento soft-touch. Protecao contra impactos com bordas elevadas para camera e tela. Totalmente personalizavel com suas fotos e designs favoritos." |
| colors | Preto (#1a1a1a), Branco (#f5f5f5), Azul (#3b82f6), Vermelho (#ef4444) |
| specs | Material, Peso, Dimensoes, Compatibilidade, Protecao, Acabamento, Carregamento sem fio |
| images | 3 imagens placeholder do Unsplash |
| rating | Entre 4.5 e 4.9 (variado) |
| review_count | Entre 20 e 80 (variado) |
| active | true |

## Convencao de slug
- Formato: `marca-modelo` em lowercase, espacos substituidos por `-`
- Exemplo: `iPhone 16 Pro Max` -> `iphone-16-pro-max`
- Exemplo: `Galaxy S25 Ultra` -> `galaxy-s25-ultra`
- Exemplo: `Redmi note14 Pro` -> `redmi-note14-pro`

## Convencao de nome
- Formato: `Capa [Modelo]`
- Exemplo: `Capa iPhone 16 Pro Max`
- Exemplo: `Capa Galaxy S25 Ultra`

## Execucao
Serao executados 4 blocos de INSERT (um por fabricante) usando a ferramenta de insercao de dados no banco, com specs e dimensoes aproximadas por modelo.

## Secao tecnica
- Cada INSERT contera todos os campos: slug, name, description, price_cents, images, specs, colors, rating, review_count, active
- Os campos stripe_price_id e stripe_product_id ficarao NULL (serao preenchidos ao sincronizar com Stripe pelo painel admin)
- Specs incluirao dimensoes e pesos aproximados por modelo baseados em dados publicos dos fabricantes

