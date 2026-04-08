

## Corrigir fundo e tamanho da imagem no lightbox

### Arquivo: `src/components/AiGalleryModal.tsx`

**Duas alterações pontuais:**

1. **Fundo opaco** — Trocar `bg-black/95` por `bg-black` no container do lightbox (linha ~89) para eliminar transparência que deixa o conteúdo da landing vazando.

2. **Imagem menor no mobile** — Reduzir de `max-w-[85vw] max-h-[70vh]` para `max-w-[80vw] max-h-[65vh]` na tag `<img>` do lightbox (linha ~119), garantindo mais padding ao redor e área clicável para fechar.

Nenhum outro arquivo alterado.

