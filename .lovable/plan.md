

# Imagem não aparece na lista de produtos do admin

## Problema
A coluna "Img" na tabela do admin usa `p.images?.[0]` para exibir a imagem. Porém, muitos produtos têm a imagem em `device_image` e o array `images` está vazio — resultando no quadrado cinza.

## Correção

### `src/components/admin/ProductsTable.tsx`
- Alterar a lógica de exibição da imagem para usar **fallback**: `p.images?.[0] || p.device_image`
- Assim, se não houver imagens na galeria, mostra a imagem do aparelho

### Resultado
A coluna "Img" mostrará a primeira imagem da galeria ou, na ausência, a imagem do aparelho — eliminando os quadrados cinza.

