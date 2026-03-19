

## Plano: Ajustar tamanho do logo em todos os dispositivos

O logo está aparecendo muito pequeno, especialmente no header (28px mobile / 32px desktop). Vou aumentar proporcionalmente em todos os pontos de uso.

### Alterações

| Arquivo | Atual | Novo |
|---------|-------|------|
| `AppHeader.tsx` | `h-7 sm:h-8` (28px/32px) | `h-9 sm:h-10` (36px/40px) |
| `Landing.tsx` (footer) | `h-8` (32px) | `h-10` (40px) |
| `Login.tsx` | `h-12` (48px) | `h-14` (56px) |
| `Signup.tsx` (2 ocorrências) | `h-12` (48px) | `h-14` (56px) |
| `CheckoutSuccess.tsx` | `h-10` (40px) | `h-12` (48px) |

Isso garante que o logo fique legível no mobile (36px mínimo) e com presença adequada no desktop.

