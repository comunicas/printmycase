

## Ajustar espaçamento da modal LowResolutionDialog

### Problema
No mobile, o `DialogContent` base usa `grid h-full` que espalha o conteúdo pela tela inteira, criando grandes espaços vazios entre o header, a resolução e os botões.

### Solução
Adicionar `place-content-center` ao `DialogContent` da modal para centralizar o conteúdo verticalmente no mobile, e reduzir o `gap` para manter tudo compacto.

### Alteração

**`src/components/customize/LowResolutionDialog.tsx`**
- Adicionar `place-content-center gap-3` ao `DialogContent` para centralizar e compactar o conteúdo no fullscreen mobile
- Mover a resolução para dentro do `DialogHeader` (junto ao texto) para eliminar espaço extra

```tsx
<DialogContent className="sm:max-w-xs place-content-center">
  <DialogHeader className="items-center text-center">
    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
      <ZoomIn className="w-7 h-7 text-primary" />
    </div>
    <DialogTitle className="text-base">Resolução baixa</DialogTitle>
    <DialogDescription className="text-sm">
      Filtros de estilo precisam de no mínimo 256×256px para gerar bons
      resultados. Use o Upscale IA para aumentar a resolução da sua imagem.
    </DialogDescription>
    {resolution && (
      <p className="text-xs text-muted-foreground pt-1">
        Sua imagem: <span className="font-medium text-foreground">{resolution.w}×{resolution.h}px</span>
      </p>
    )}
  </DialogHeader>

  <DialogFooter className="flex-row gap-2 sm:flex-row">
    ...
  </DialogFooter>
</DialogContent>
```

