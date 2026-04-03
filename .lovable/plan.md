
## Corrigir “Imagem Posição” para ser um print da tela de customização

### O que está errado hoje
Hoje a “Imagem Posição” ainda nasce de `renderSnapshot(...)`, que gera só a arte recortada no frame lógico.  
Mesmo o `renderPreviewWithMockup(...)` atual ainda é uma composição em canvas da arte + moldura do aparelho, não um “print” da tela de customização como o usuário realmente configurou.

### Objetivo
Fazer com que **“Imagem Posição”** seja um **screenshot visual da área de customização** já configurada pelo usuário, mostrando o celular como ele vê na tela.

### Abordagem
Em vez de tratar “Imagem Posição” como um render técnico de imagem, vou tratá-la como **captura do preview real da customização**.

### Implementação

**1. `src/pages/Customize.tsx`**
- Criar um `ref` para a área visual que representa a customização final
- Passar esse `ref` para o preview principal
- Garantir que overlays temporários não entrem na captura:
  - spotlight
  - loading de IA
  - preview temporário de hover dos filtros
  - hints de arraste

**2. `src/components/PhonePreview.tsx`**
- Permitir receber um `captureRef` ou envolver o mockup principal em um container identificável
- Marcar elementos que não devem entrar no screenshot
- Garantir que a área capturada seja exatamente o “celular na tela”, com o enquadramento visual do usuário

**3. Nova estratégia de captura**
- Substituir o uso de `renderSnapshot(...)` como fonte da “Imagem Posição”
- Criar uma nova função utilitária para gerar um screenshot do preview real da customização
- Essa função deve capturar o DOM renderizado do preview, não apenas reconstruir a arte via canvas
- Se necessário, adicionar uma lib de captura de DOM compatível com React/Vite

**4. `src/hooks/useCustomize.tsx`**
- No `handleContinue`, gerar:
  - imagem técnica separada, se ainda precisarmos para produção
  - nova **Imagem Posição = screenshot do preview da customização**
- Salvar essa captura no storage e gravar no pending checkout
- Atualizar os nomes dos campos para evitar ambiguidade entre:
  - recorte técnico
  - screenshot visual da customização

**5. `src/pages/Checkout.tsx`**
- Repetir a mesma lógica no checkout final
- Enviar a captura visual como a imagem principal de “Imagem Posição”
- Manter consistência entre pedido pendente e pedido finalizado

**6. `src/components/admin/OrderImagesPreviewer.tsx`**
- Fazer “Imagem Posição” apontar para o novo screenshot da customização
- Se o recorte técnico continuar existindo, exibir com outro nome, por exemplo:
  - “Recorte técnico”
- Remover a confusão entre “Preview” e “Imagem Posição”

### Resultado esperado
- “Imagem Posição” passa a mostrar o que o usuário realmente viu ao customizar
- O admin deixa de ver uma imagem crua e passa a ver um print fiel da customização
- O recorte técnico pode continuar salvo, mas não será mais confundido com a imagem de posição

### Detalhes técnicos
- O código atual usa canvas para reconstruir a composição; isso não atende ao pedido porque não é um screenshot real da UI
- A captura deve ser feita do preview DOM já renderizado
- Vou excluir elementos transitórios da captura para não poluir a imagem final
- Se houver limitação de CORS com assets externos, a captura deve usar URLs seguras/carregadas no mesmo contexto já usado pelo preview

### Arquivos envolvidos
- `src/pages/Customize.tsx`
- `src/components/PhonePreview.tsx`
- `src/hooks/useCustomize.tsx`
- `src/pages/Checkout.tsx`
- `src/components/admin/OrderImagesPreviewer.tsx`
- possivelmente `src/lib/image-utils.ts` ou um novo utilitário específico de captura

