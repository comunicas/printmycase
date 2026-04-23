
Objetivo: reduzir apenas o abaulado inferior da safezone nos modelos `iphone-17-pro-max` e `iphone-17-air`, mantendo o restante da geometria atual.

1. Ajustar os presets específicos desses dois aparelhos
- Atualizar `src/components/PhonePreview.tsx` em `SAFE_ZONE_PRESETS`.
- Reduzir o valor de `bottomRadius` de:
  - `iphone-17-pro-max`
  - `iphone-17-air`
- Manter `top`, `height`, `insetX` e `radius` como estão, para não alterar largura, altura nem o arredondamento superior.

2. Preservar o comportamento dos outros modelos
- Não alterar:
  - `iphone-12-pro-max`
  - `iphone-15-pro-max`
  - `iphone-17-pro`
  - `DEFAULT_SAFE_ZONE_PRESET`
- Isso garante que a mudança fique isolada somente nos dois modelos citados.

3. Resultado visual esperado
- A base da safezone ficará menos “abaulada”.
- O formato continuará vertical e próximo do desenho atual, porém com a parte inferior mais reta e discreta.

Detalhes técnicos
- Arquivo a editar:
  - `src/components/PhonePreview.tsx`
- Campo a ajustar:
  - `SAFE_ZONE_PRESETS["iphone-17-pro-max"].bottomRadius`
  - `SAFE_ZONE_PRESETS["iphone-17-air"].bottomRadius`
- Estratégia:
  - diminuir apenas o `borderBottomLeftRadius` e `borderBottomRightRadius`, já que eles usam `bottomRadius` quando o preset não define `width`.
