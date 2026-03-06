

## Adicionar imagem em parallax na seção WhyArtisCase

A copy ja foi aplicada no ultimo edit. Agora vou adicionar a imagem da PrintMyCase como fundo parallax na seção de beneficios.

### Mudancas

**Copiar imagem para o projeto:**
- `user-uploads://image-43.png` → `src/assets/printmycase-hero.png`

**`src/components/WhyArtisCase.tsx`:**
- Importar a imagem
- Adicionar como background da section com efeito parallax CSS (`background-attachment: fixed`, `background-size: cover`, `background-position: center`)
- Aplicar overlay escuro (`bg-black/70` ou similar) sobre a imagem para manter legibilidade do texto branco
- Estrutura: section com `relative` + imagem absolute com `fixed` attachment + overlay div + conteudo por cima

### Layout

```text
┌─────────────────────────────────────────────┐
│  [imagem parallax - fixed background]       │
│  ┌─ overlay bg-black/70 ──────────────────┐ │
│  │  Proteção e estilo em cada detalhe     │ │
│  │  [3 cards benefícios]                  │ │
│  │  [tech attributes + video]             │ │
│  └────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

A imagem rola em velocidade diferente do conteudo, criando profundidade visual. O overlay garante contraste para leitura.

