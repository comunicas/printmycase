

## Remover título redundante do produto

### Problema
O nome do modelo ("Motorola edge 50 pro") aparece duas vezes: na top bar da página e dentro do PhonePreview, acima do mockup.

### Correção

**src/components/PhonePreview.tsx** — Remover o `<div>` que exibe `modelName` acima do mockup (linhas 145-148):

```tsx
// REMOVER:
<div className="text-xs font-medium text-muted-foreground">
  {modelName ?? "iPhone"}
</div>
```

O título já está visível na top bar minimal do `Customize.tsx`. Nenhuma outra alteração necessária.

### Verificação do layout
- **Mobile (375×812)**: Layout ocupa viewport inteira, sem scroll. Bottom bar visível.
- **Desktop (1440×900)**: Layout ocupa viewport inteira, sem scroll. Controles centralizados.

Ambos confirmados via teste no browser.

