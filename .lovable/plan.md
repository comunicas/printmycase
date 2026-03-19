

## Plano: Aumentar logo em 50% em todos os dispositivos

Valores atuais e novos (aumento de ~50%):

| Arquivo | Atual | Novo (50% maior) |
|---------|-------|-------------------|
| `AppHeader.tsx` | `h-10 sm:h-12` (40px/48px) | `h-14 sm:h-16` (56px/64px) |
| `Landing.tsx` (footer) | `h-12` (48px) | `h-16` (64px) |
| `Login.tsx` | `h-16` (64px) | `h-24` (96px) |
| `Signup.tsx` (2 ocorrências) | `h-16` (64px) | `h-24` (96px) |
| `CheckoutSuccess.tsx` | `h-14` (56px) | `h-20` (80px) |

### Arquivos alterados
- `src/components/AppHeader.tsx` — linha 48
- `src/pages/Landing.tsx` — linha 289
- `src/pages/Login.tsx` — linha 60
- `src/pages/Signup.tsx` — linhas 72 e 92
- `src/pages/CheckoutSuccess.tsx` — linha 81

