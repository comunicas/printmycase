

## Animação suave no accordion do FAQ

O accordion já usa `animate-accordion-down` e `animate-accordion-up`, mas os keyframes atuais no `tailwind.config.ts` só animam `height` sem transição de opacidade. A animação pode parecer brusca.

### Alterações

#### 1. `tailwind.config.ts` — Melhorar keyframes do accordion

Adicionar `opacity` aos keyframes existentes para um fade suave junto com a expansão de altura:

```ts
'accordion-down': {
  from: { height: '0', opacity: '0' },
  to: { height: 'var(--radix-accordion-content-height)', opacity: '1' }
},
'accordion-up': {
  from: { height: 'var(--radix-accordion-content-height)', opacity: '1' },
  to: { height: '0', opacity: '0' }
},
```

Aumentar duração das animações de `0.2s` para `0.3s` com `ease-in-out`:

```ts
'accordion-down': 'accordion-down 0.3s ease-in-out',
'accordion-up': 'accordion-up 0.3s ease-in-out',
```

#### 2. `src/components/FaqSection.tsx` — Nenhuma alteração necessária

O componente já aplica as classes `animate-accordion-down` e `animate-accordion-up` corretamente.

Resultado: abertura/fechamento com fade + slide suave em 0.3s.

