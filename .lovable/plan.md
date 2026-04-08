

## Corrigir Lightbox Mobile + Adicionar Navegação entre Imagens

### Problemas encontrados no teste

1. **Imagem cobre toda a tela no mobile** — com `max-w-full max-h-[80vh]`, imagens altas ocupam toda a viewport, escondendo os botoes de voltar/fechar e eliminando area clicavel do backdrop
2. **Backdrop nao fecha o lightbox** — sem area visivel para clicar fora da imagem no mobile
3. **Sem navegacao entre imagens** — nao ha como ir para a proxima/anterior sem voltar ao grid

### Correcoes e melhorias

**Arquivo: `src/components/AiGalleryModal.tsx`**

**1. Lightbox mobile — garantir botoes visiveis e area clicavel**
- Top bar com botoes ChevronLeft e X usa `absolute top-0` com `z-20` para ficar sobre a imagem
- Fundo semi-transparente nos botoes para contraste
- Imagem limitada a `max-h-[70vh]` no mobile para garantir espaco superior/inferior clicavel

**2. Navegacao entre imagens (setas + swipe)**
- Guardar o indice atual em vez de URL (`lightboxIndex: number | null`)
- Botoes ChevronLeft/ChevronRight nas laterais (semi-transparentes, `absolute left-2 / right-2`)
- Suporte a swipe horizontal via `onTouchStart` / `onTouchEnd` com deteccao de direcao (threshold 50px)
- Contador "3 / 12" discreto no topo central

**3. Estrutura do lightbox refatorado**

```text
┌──────────────────────────────┐
│  ← voltar       3/12      X │  ← top bar (z-20, bg-black/50)
│                              │
│  ‹  ┌──────────────┐  ›     │  ← setas laterais
│     │              │         │
│     │    IMAGEM    │         │
│     │              │         │
│     └──────────────┘         │
│                              │
│     tap area = fecha         │
└──────────────────────────────┘
```

### Detalhes tecnicos

- Estado muda de `lightboxUrl: string | null` para `lightboxIndex: number | null`
- A URL e derivada de `images[lightboxIndex]` usando `getOptimizedUrl`
- Swipe usa refs `touchStartX` e `touchEndX`, calcula delta no `onTouchEnd`
- Navegacao circular (ultimo → primeiro e vice-versa)
- Botoes de seta ficam ocultos se ha apenas 1 imagem

