

## Melhorar contraste da sidebar + adicionar resumo do produto

### Problemas identificados
- Sidebar direita no desktop não tem contraste — fundo igual ao resto da página (branco)
- Não há referência visual do produto escolhido na sidebar (só aparece no header)

### Alterações

**`src/pages/Customize.tsx` — sidebar desktop (linha 73)**

1. **Contraste**: Adicionar `bg-muted/40 border-l` à `<aside>` para criar separação visual
2. **Resumo do produto**: Acima do título "Personalize sua Case", adicionar bloco com:
   - Imagem do device (`product.device_image` ou `product.images[0]`) — thumbnail ~64px
   - Nome do produto
   - Preço formatado (`formatPrice(product.price_cents / 100)`)
   - Layout: flex row com imagem à esquerda e texto à direita

### Resultado visual
```text
┌─────────────────────┐
│ [📱 img]  Galaxy S24+│
│           R$ 69,90   │
├─────────────────────┤
│ Personalize sua Case │
│ [Ajustes] [Filtros]  │
│ Zoom ────●────────── │
│ Girar  Expandir  HD  │
│                      │
│    [Finalizar →]     │
└─────────────────────┘
```

### Arquivo afetado
- `src/pages/Customize.tsx` — sidebar `<aside>` (linhas 72-99)

