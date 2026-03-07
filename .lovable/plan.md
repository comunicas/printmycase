
## Adicionar Fade Suave ao Comparar Imagem Original vs Filtrada

### Análise Atual
O `PhonePreview.tsx` já tem um sistema robusto de crossfade implementado (CROSSFADE_MS = 350):
- Usa duas camadas de imagem (`prevImage` e `displayImage`)
- Controla opacidade com `fadeIn` state
- Aplica transição de opacidade em 350ms com easing

Quando `handleCompareStart`/`handleCompareEnd` são chamados em `Customize.tsx`, eles simplesmente fazem `setImage()` que dispara o `useEffect` existente do crossfade. Portanto, **a animação fade já funciona automaticamente** para a comparação!

### Possível Melhoria (Opcional)
Se o usuário quiser uma transição **ainda mais suave** ou com comportamento específico para o "hold to compare":
1. Reduzir CROSSFADE_MS de 350ms para 200-250ms para comparação ser mais rápida
2. Usar easing diferente (ex: `ease-in-out` em vez de `ease-out`) para sensação mais fluida
3. Adicionar uma flag `isComparing` para diferenciar transições de comparação vs filtro normal

### Recomendação
A animação já está implementada via o sistema de crossfade existente. Validar com o usuário se a transição atual (350ms) está satisfatória ou se prefere ajustar o tempo/easing.
