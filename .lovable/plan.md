

## Adicionar texto "Baixar imagem" ao lado do ícone de download

### Alteração

**`src/components/customize/ContinueBar.tsx`** — linha 27

Trocar o botão `size="icon"` por um botão com texto:
- Remover `size="icon"` e a classe `w-10`
- Adicionar texto "Baixar imagem" ao lado do ícone `<Download />`
- Remover o `Tooltip` wrapper (redundante com texto visível)
- Manter `variant="outline"` e `gap-1.5`

### Resultado
```
[↓ Baixar imagem]  [Finalizar →]
```

### Arquivo afetado
- `src/components/customize/ContinueBar.tsx` — bloco `downloadButton` (linhas 23-34)

