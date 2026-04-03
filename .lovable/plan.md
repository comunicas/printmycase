

## Auto-expandir zoom ao rotacionar para cobrir o frame

### Problema
Ao rotacionar 90°/270°, a imagem (originalmente portrait) fica em landscape dentro do frame portrait, criando espaços cinza em cima e embaixo. O `background-size: cover` cobre baseado na orientação original, mas com rotação o eixo mais curto da imagem fica alinhado ao eixo mais longo do frame.

### Solução

**Arquivo: `src/components/PhonePreview.tsx`**

Calcular um fator de escala mínimo quando a rotação é 90° ou 270° para garantir cobertura total. O frame tem aspect ratio ~1:2.046 (260/532). Quando a imagem é rotacionada 90°, o `cover` precisa de escala extra proporcional ao aspect ratio do frame:

- Para rotação 0°/180°: scale mínimo = `scale / 100` (como hoje)
- Para rotação 90°/270°: scale mínimo = `scale / 100 * (frameH / frameW)` ≈ `scale / 100 * 2.046`

Mudança no `buildImageStyle` e nos estilos de transform:
1. Calcular `effectiveScale`: se rotação é 90° ou 270°, multiplicar o scale pelo aspect ratio do frame (~532/260 ≈ 2.046) para garantir cobertura
2. Aplicar `transform: rotate(${rotation}deg) scale(${effectiveScale})` nos layers de imagem

**Arquivo: `src/hooks/useCustomize.tsx`**

Nenhuma mudança necessária — o ajuste é puramente visual no componente de preview.

### Resultado
- 1 arquivo editado (`PhonePreview.tsx`)
- Ao girar 90°, a imagem auto-escala para cobrir o frame inteiro
- O slider de zoom continua funcionando normalmente sobre o fator base
- Sem espaços cinza em nenhuma rotação

