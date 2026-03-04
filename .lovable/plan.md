

# Validação de Resolução de Imagem no Upload

## Situação Atual
Não há nenhuma validação — qualquer imagem é aceita. O mockup exibe em 260×532px (tela), mas para impressão de capas (~7×15cm) é necessário no mínimo **827×1772px a 300 DPI**.

## Proposta

### 1. Validar resolução no upload (`src/pages/Customize.tsx`)
- Ao receber o arquivo, criar um `Image()` para ler `naturalWidth` e `naturalHeight`
- Se menor que 800×1600px, mostrar toast de **aviso** (não bloquear) informando que a qualidade pode ficar comprometida
- Se menor que 400×800px, mostrar toast **destrutivo** recomendando outra imagem

### 2. Indicador visual de qualidade (`src/components/PhonePreview.tsx`)
- Badge discreto no canto do preview: "HD" (verde) se resolução boa, "Baixa resolução" (amarelo/vermelho) se insuficiente

### 3. Texto informativo
- Adicionar texto auxiliar no estado vazio do upload: "Recomendado: 827×1772px ou superior"

### Arquivos afetados
- `src/pages/Customize.tsx` — validação no `handleImageUpload`
- `src/components/PhonePreview.tsx` — badge de qualidade e texto de recomendação

