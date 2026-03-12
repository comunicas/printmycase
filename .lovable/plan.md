

## Revisão da Galeria de Gerações IA — Visualização Full + Adicionar a Produto

### O que muda

1. **Lightbox para imagem full** — Ao clicar na imagem gerada, abre um dialog/modal com a imagem em tamanho completo e os metadados (prompt, seed, tamanho, data).

2. **Botão "Adicionar a Produto"** — Novo botão em cada card da geração que abre um seletor de produtos existentes. Ao selecionar, a URL da imagem é adicionada ao array `images` do produto escolhido.

3. **Manter "Mover p/ Galeria"** — O botão existente para galeria ilustrativa continua.

### Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `src/components/admin/AiGenerationsManager.tsx` | Adicionar lightbox modal, botão "Adicionar a Produto" com seletor de produtos, lógica de append da URL ao array `images` do produto |

### Detalhes técnicos

- **Lightbox**: Dialog do Radix com `img` em tamanho real (`object-contain`, max-h/max-w limitados ao viewport).
- **Seletor de produtos**: Ao clicar "Adicionar a Produto", abre dialog com lista de produtos (query `products` com `name` e `id`). Ao selecionar, faz `UPDATE products SET images = array_append(images, url) WHERE id = ?`.
- Tudo em um único componente para simplicidade, sem necessidade de migration (usa coluna `images` existente no `products`).

