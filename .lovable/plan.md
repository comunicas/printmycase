

## Adicionar frame do smartphone na imagem Final

### O que muda
Expandir o canvas do `renderSnapshot` para incluir a borda/frame do smartphone ao redor da imagem, produzindo um mockup realista idêntico ao que o usuário vê na UI.

### Implementação — `src/lib/image-utils.ts`

1. **Aumentar o canvas** para incluir a borda: adicionar padding ao redor (ex: `BORDER = 5px` proporcional, `RADIUS = ~36px` para o rounded corners)
2. **Desenhar o frame** antes da imagem:
   - Preencher o canvas com fundo transparente ou branco
   - Desenhar um `roundRect` com a cor da borda (`foreground/80` → preto/cinza escuro)
   - Desenhar um `roundRect` interno com o fundo do telefone
   - Clipar a região interna para desenhar a imagem do usuário
3. **Manter toda a lógica de posicionamento existente**, apenas offset por `BORDER`
4. **Usar PNG** em vez de JPEG para preservar transparência do fundo (ou fundo branco)

```text
Canvas final:
┌──────────────────────┐
│  border (5px, dark)  │
│  ┌────────────────┐  │
│  │                │  │
│  │  user image    │  │
│  │  (clipped,     │  │
│  │   positioned)  │  │
│  │                │  │
│  └────────────────┘  │
└──────────────────────┘
  rounded corners ~36px
```

### Constantes
- `FRAME_BORDER = 5` (matching CSS `border-[5px]`)
- `FRAME_RADIUS = 36` (matching CSS `rounded-[2.8rem]`)
- Canvas: `(PHONE_W + 2*BORDER) × (PHONE_H + 2*BORDER)`

### Arquivo
- `src/lib/image-utils.ts` — função `renderSnapshot`

