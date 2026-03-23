

## Refatorar preview: mostrar imagem do estilo do filtro no smartphone

### O que o usuário quer
Ao segurar (long-press) um filtro, a **imagem de estilo do filtro** (`style_image_url`) aparece dentro do smartphone em tela cheia — para o usuário ver o resultado visual que vai "comprar". Não é CSS filter na foto do usuário.

### Alterações

**1. `src/components/PhonePreview.tsx`**
- Remover prop `cssFilter`
- Adicionar prop `previewImageUrl?: string | null`
- Quando `previewImageUrl` está presente: renderizar uma camada extra (`<div>` ou `<img>`) com essa imagem cobrindo 100% do phone, com `object-fit: cover` e `z-index` acima da imagem do usuário
- Transição suave de opacidade (fade-in 0.2s)

**2. `src/components/customize/AiFiltersList.tsx`**
- No `handlePointerDown`: em vez de chamar `onPreviewStart(filter.preview_css)`, chamar `onPreviewStart(filter.style_image_url)` — a URL da imagem de estilo
- A prop `onPreviewStart` passa a receber `string` (URL) em vez de CSS filter string
- Remover dependência do campo `preview_css` na lógica de long-press
- Condição: só ativa long-press se `filter.style_image_url` existir

**3. `src/pages/Customize.tsx`**
- Renomear estado `previewCssFilter` → `previewImageUrl`
- Passar como `previewImageUrl` para `PhonePreview` em vez de `cssFilter`

**4. `src/components/customize/ImageControls.tsx`**
- Renomear props `onPreviewStart`/`onPreviewEnd` — mantém assinatura, só muda o dado passado (URL em vez de CSS)

### Resultado
- Long-press → imagem de referência do filtro aparece no smartphone
- Soltar → volta à foto do usuário
- Tap curto → modal de confirmação com custo 🪙

### Arquivos afetados
| Arquivo | Alteração |
|---------|-----------|
| `src/components/PhonePreview.tsx` | Trocar `cssFilter` por `previewImageUrl`, overlay de imagem |
| `src/components/customize/AiFiltersList.tsx` | Passar `style_image_url` em vez de `preview_css` |
| `src/pages/Customize.tsx` | Renomear estado |

