
## Mudança

Reduzir `width=400` para `width=320` apenas na grid de coleções da **Landing page** (que é o que o Lighthouse apontou — exibido a 312px CSS, mesmo em 2x densidade fica 624px, e 320 já cobre razoavelmente sem perda perceptível em mobile/desktop comum).

### Arquivo
- `src/pages/Landing.tsx` linha 195: `getOptimizedUrl(design.image_url, 400)` → `getOptimizedUrl(design.image_url, 320)`

### Por que não mudar o default global?
O default 400 é usado também por `AiGalleryModal` e `AiCoinsSection` (cards maiores), onde 320 pioraria a nitidez. Mantemos a mudança cirúrgica.

### Impacto
- ~14KB economizados por imagem na home (conforme audit)
- Sem alteração visual perceptível (display ~312px CSS)
- Zero risco em outras telas
