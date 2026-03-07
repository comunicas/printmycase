

## Melhorar UX e animações dos toasts

O projeto **não usa framer-motion** atualmente, e adicioná-lo só para toasts seria peso desnecessário (~30KB). Em vez disso, usaremos **CSS keyframes customizados** no Tailwind — que já é o padrão do projeto para animações (accordion, fade-in, scale-in, etc).

### Mudanças

#### 1. Adicionar keyframes `toast-slide-down` e `toast-fade-out-up` no `tailwind.config.ts`

```js
"toast-slide-down": {
  "0%": { opacity: "0", transform: "translateY(-100%) scale(0.95)" },
  "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
},
"toast-fade-out-up": {
  "0%": { opacity: "1", transform: "translateY(0) scale(1)" },
  "100%": { opacity: "0", transform: "translateY(-100%) scale(0.95)" }
}
```

E as animações correspondentes:
```js
"toast-in": "toast-slide-down 0.35s cubic-bezier(0.16,1,0.3,1)",
"toast-out": "toast-fade-out-up 0.25s ease-in forwards"
```

#### 2. Atualizar `toast.tsx` — variantes de animação

Substituir as classes de animação do Radix (`animate-in/out`, `slide-in-from-top-full`, etc.) por nossas keyframes customizadas:

```
data-[state=open]:animate-toast-in data-[state=closed]:animate-toast-out
```

Também melhorar o visual: border mais suave com `rounded-xl`, sombra elevada `shadow-xl`, e padding mais compacto `p-4 pr-8`.

#### 3. Melhorar `toaster.tsx` — auto-dismiss e ícone visual

- Adicionar `duration={4000}` no `ToastProvider` para auto-dismiss de 4 segundos
- Adicionar ícone contextual: `CheckCircle2` para sucesso (default) e `AlertCircle` para erros (destructive)
- Progress bar sutil na base do toast para indicar tempo restante

### Arquivos alterados

| Arquivo | O quê |
|---------|-------|
| `tailwind.config.ts` | Novos keyframes e animações |
| `src/components/ui/toast.tsx` | Novas classes de animação e visual |
| `src/components/ui/toaster.tsx` | Auto-dismiss, ícones, progress bar |

