

## Resultados do Teste + Correção do Lightbox

### Teste Mobile (390px) — Badges Truncados

**Status: OK** ✓

Os badges de filtro estão visíveis sem hover e truncados corretamente:
- "Create a square prem…" (truncado em 20 chars)
- "pixel_art", "hyperrealistic" (curtos, sem truncamento)
- "Crie uma imagem com …" (truncado)
- "Transform the image …" (truncado)

### Bug do Lightbox — Confirmado

Clicar no fundo escuro ao redor da imagem **não fecha** o lightbox. O motivo: no mobile, a imagem ocupa quase toda a tela (`max-w-[90vw]` = 351px de 390px) e tem `onClick stopPropagation`. A área clicável do backdrop restante é mínima (~20px de cada lado), e o click programático no div também falha porque o evento é capturado pela imagem.

### Correção

**Arquivo: `src/components/AiGalleryModal.tsx`** (lightbox, linhas 50-65)

Reestruturar o lightbox para separar claramente backdrop e conteúdo:

```tsx
// Lightbox view
if (lightboxUrl) {
  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col">
      {/* Top bar with buttons */}
      <div className="flex items-center justify-between px-4 py-3 z-10">
        <button className="text-white/70 hover:text-white" onClick={() => setLightboxUrl(null)}>
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button className="text-white/70 hover:text-white" onClick={onClose}>
          <X className="h-6 w-6" />
        </button>
      </div>
      {/* Image area — tap anywhere outside image closes */}
      <div
        className="flex-1 flex items-center justify-center p-4"
        onClick={() => setLightboxUrl(null)}
      >
        <img
          src={lightboxUrl}
          alt="Geração IA"
          className="max-w-full max-h-[80vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
}
```

**Mudanças-chave:**
1. Separar a barra de botões do fundo clicável — agora os botões ficam num div fixo no topo, não absolutos sobre a imagem
2. O backdrop clicável é o `flex-1` container ao redor da imagem, com padding generoso (`p-4`) criando área clicável real
3. Imagem usa `max-w-full` em vez de `max-w-[90vw]` para ter mais margem nas laterais
4. Botão de voltar (`ChevronLeft`) volta à galeria grid; botão X fecha tudo

