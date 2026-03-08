
## Remover módulo de câmera do frame

### O que fazer
Deletar as linhas 256-262 que contêm o módulo de câmera (zona de segurança com ícone e texto "Câmera").

### Mudança
**Arquivo**: `src/components/PhonePreview.tsx`  
**Linhas a remover**: 256-262 (comentário + conditional que renderiza a caixa de câmera)

```tsx
// REMOVER ESSAS LINHAS:
{/* Camera module overlay */}
{image && (
  <div className="absolute top-2 left-2 lg:top-3 lg:left-3 z-20 pointer-events-none w-[30%] h-[14%] rounded-xl border border-dashed border-foreground/15 bg-foreground/5 flex flex-col items-center justify-center gap-0.5">
    <Camera className="w-3 h-3 text-foreground/20" />
    <span className="text-[8px] text-foreground/20 font-medium">Câmera</span>
  </div>
)}
```

### Resultado
Frame simples e limpo, sem nenhuma zona de segurança ou marcação visual.
