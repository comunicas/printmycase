
## Corrigir Imagem Não Cobrindo o Frame Inteiro

### Problema
O `backgroundSize` atual usa um valor percentual único (`${scale * (100 / oversize)}%`), que dimensiona a imagem pela **largura** do container. Se a imagem tem proporção diferente do frame do celular (≈1:2), a altura não cobre o frame — surgem espaços em cima e embaixo.

### Solução

**Arquivo: `src/components/PhonePreview.tsx`** — função `buildImageStyle`

Trocar a estratégia de sizing: usar `background-size: cover` como base (garante cobertura total sempre) e aplicar o zoom via `transform: scale()` no elemento da imagem.

Mudanças:
1. `backgroundSize` → `"cover"` (fixo, sempre cobre o frame)
2. Remover o container oversized (`oversize`/`offset`) — não é mais necessário pois `cover` + `transform` fazem o trabalho
3. Adicionar `transform: scale(${scale / 100})` junto com a rotação existente
4. O container da imagem passa a ter `width: 100%; height: 100%` com `transform-origin: center`
5. Ajustar a sensibilidade do drag proporcionalmente (já existe no código)

### Resultado
- 1 arquivo editado
- Imagem sempre cobre 100% do frame, independente da proporção
- Zoom funciona via scale CSS em vez de background-size percentual
- Drag e pinch continuam funcionando normalmente
