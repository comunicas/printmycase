

## Correção: Frame parece tablet

### Problema
O `style={{ height: 'min(410px, 50dvh)', aspectRatio: '260/532' }}` inline tem prioridade sobre as classes Tailwind `lg:w-[260px] lg:h-[532px]`. No desktop, isso resulta em:
- Largura fixa: 260px (do `lg:w-[260px]`)
- Altura reduzida: ~400px (do inline style, que sobrescreve `lg:h-[532px]`)
- Aspect-ratio ignorado (porque largura E altura estão definidos)
- Resultado: 260×400 = proporção 0.65 → parece tablet

### Solução
Separar estilos mobile/desktop corretamente:

**Mobile** (< lg): usar `aspect-ratio: 260/532` com altura dinâmica `min(410px, 50dvh)`, sem largura fixa — o aspect-ratio calcula a largura automaticamente (~196px).

**Desktop** (lg+): usar as classes Tailwind `lg:w-[260px] lg:h-[532px]` sem override inline.

### Mudança em `src/components/PhonePreview.tsx` (linha 196)

Remover o inline `style` e usar classes Tailwind com arbitrary values:

```tsx
// De:
<div className="relative lg:w-[260px] lg:h-[532px] rounded-[2.2rem] lg:rounded-[2.8rem] border-[4px] lg:border-[5px] border-foreground/80 bg-foreground/5 shadow-2xl overflow-hidden" 
  style={{ height: 'min(410px, 50dvh)', aspectRatio: '260/532' }}>

// Para:
<div className="relative h-[min(410px,50dvh)] aspect-[260/532] lg:w-[260px] lg:h-[532px] lg:aspect-auto rounded-[2.2rem] lg:rounded-[2.8rem] border-[4px] lg:border-[5px] border-foreground/80 bg-foreground/5 shadow-2xl overflow-hidden">
```

- Mobile: `h-[min(410px,50dvh)]` + `aspect-[260/532]` → altura dinâmica, largura calculada pelo aspect-ratio
- Desktop: `lg:w-[260px]` + `lg:h-[532px]` + `lg:aspect-auto` → dimensões fixas corretas, aspect-ratio desativado

### Arquivo
| Arquivo | Ação |
|---------|------|
| `src/components/PhonePreview.tsx` | Trocar inline style por classes Tailwind (1 linha) |

