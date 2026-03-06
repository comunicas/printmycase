

## Corrigir logo Stripe no PaymentBadges

O SVG atual do Stripe está renderizando com letras distorcidas (visível no screenshot como "srtrle" ao invés de "stripe"). O path data precisa ser substituído pelo wordmark oficial correto.

### Alteração

Arquivo: `src/components/PaymentBadges.tsx` (linhas 51-53)

Substituir o SVG atual por um com o path correto do wordmark oficial do Stripe, ajustando o `viewBox` para corresponder às proporções corretas da marca. Usar a imagem oficial enviada como referência para validar a renderização.

