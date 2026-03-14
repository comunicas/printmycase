

## Miniatura do modelo + indicador de salvamento automático no header

### Alterações

| Arquivo | Mudança |
|---|---|
| `src/components/customize/CustomizeHeader.tsx` | Adicionar miniatura do produto (usando `product.images[0]` ou `device_image`) ao lado do nome, com tooltip/popover no hover mostrando imagem maior. Adicionar indicador sutil de "Salvo automaticamente" (ícone check + texto) que aparece brevemente quando o auto-save do sessionStorage executa |
| `src/hooks/useCustomize.tsx` | Expor `product` no retorno (já expõe). Adicionar estado `draftSaved` que fica `true` por ~2s após cada auto-save do sessionStorage |
| `src/pages/Customize.tsx` | Passar `product` e `draftSaved` ao `CustomizeHeader` |

### CustomizeHeader — Nova estrutura

```text
┌──────────────────────────────────────────┐
│ ← │ [thumb] Galaxy A56  ✓ Salvo │      │
└──────────────────────────────────────────┘
```

- **Miniatura**: imagem pequena (24x24 ou 28x28) arredondada do produto, à esquerda do nome
- **Hover/tooltip**: ao passar o mouse na miniatura, mostra imagem maior (~200px) do modelo usando `Tooltip` ou `HoverCard` do shadcn
- **Indicador de salvamento**: texto sutil "✓ Salvo" com fade-in/out que aparece por 2 segundos após cada auto-save (debounce de 500ms já existe)

### Hook — Estado de salvamento

No `useCustomize.tsx`, no bloco de auto-save (efeito com `setTimeout` de 500ms), após o `sessionStorage.setItem`, setar `draftSaved = true` e após 2s setar de volta para `false`. Expor `draftSaved` no retorno.

