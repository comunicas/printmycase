

## Verificação do Logo — Resultados e Plano de Ajuste

### Problemas encontrados

1. **Header (mobile e desktop)**: O logo aparece como um ícone muito pequeno e quase invisível, especialmente no desktop com header transparente. O logo parece ser quadrado/compacto, mas os atributos HTML `width={149} height={32}` sugerem um logo horizontal — há um descasamento.

2. **Footer (Landing)**: Logo também aparece pequeno (`h-10`), difícil de ler.

3. **Login/Signup**: Logo em `h-14` (56px) aparece legível mas ainda pequeno para uma página de branding.

4. **Desktop header transparente**: Na hero, o logo é praticamente invisível contra o fundo escuro — muito pequeno para ser notado.

### Plano de Correção

| Local | Atual | Proposto |
|-------|-------|----------|
| `AppHeader.tsx` | `h-9 sm:h-10` + `width={149} height={32}` | `h-10 sm:h-12` + remover width/height fixos (deixar w-auto calcular) |
| `Landing.tsx` (footer) | `h-10` + `width={149} height={32}` | `h-12` + remover width/height fixos |
| `Login.tsx` | `h-14` | `h-16` |
| `Signup.tsx` (2 ocorrências) | `h-14` | `h-16` |
| `CheckoutSuccess.tsx` | `h-12` | `h-14` |

Além disso, remover os atributos `width={149} height={32}` que não refletem as proporções reais do novo logo (o logo PrintMyCase é mais quadrado/compacto que o antigo). Isso evita distorção e deixa o CSS controlar o tamanho corretamente.

### Arquivos alterados
- `src/components/AppHeader.tsx`
- `src/pages/Landing.tsx`
- `src/pages/Login.tsx`
- `src/pages/Signup.tsx`
- `src/pages/CheckoutSuccess.tsx`

