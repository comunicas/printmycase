

## Spotlight Sempre Visível + Nome do Modelo no Texto

### Mudanças

**1. `src/pages/Customize.tsx`**
- Remover a lógica de `localStorage` do `showUploadSpotlight` — o spotlight aparece **sempre** que não há imagem, independente de ser primeira visita ou não
- Remover o `dismissSpotlight` que grava no localStorage (apenas fechar o state)
- Passar `productName` como prop ao `UploadSpotlight`

**2. `src/components/customize/UploadSpotlight.tsx`**
- Adicionar prop `modelName: string`
- Atualizar título para incluir o modelo: **"Personalize sua capa {modelName}"**
- Subtítulo: **"Envie uma foto sua, do pet, da família… nós transformamos na capa perfeita para o seu {modelName}!"**

### Resultado
- 2 arquivos editados
- Spotlight aparece sempre que não há imagem (sem localStorage)
- Texto personalizado com o nome do modelo escolhido

