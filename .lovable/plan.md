

## Melhorias na Tab Bar e Overlay Mobile

### Problema atual
Pela screenshot, a MobileTabBar aparece flutuando entre o preview e o rodapé, e o overlay abre com `animate-fade-in` (opacidade) sem animação de slide-up. O overlay ocupa tela inteira dificultando o fechamento rápido.

### Alterações

**1. `src/pages/Customize.tsx`**
- Mover o `<MobileTabBar>` para ficar imediatamente acima do `<ContinueBar>` mobile, dentro de um wrapper fixo no bottom
- Agrupar `MobileTabBar` + `ContinueBar` mobile num bloco fixo no rodapé para que fiquem sempre grudados

**2. `src/components/customize/MobileTabOverlay.tsx`**
- Trocar `animate-fade-in` por animação de **slide-up from bottom**
- O overlay não ocupa mais `inset-0` — posicionar como bottom sheet que sobe até ~60% da tela (deixando o preview visível no topo)
- Backdrop escurecido no topo — clicar nele fecha o overlay
- Adicionar animação CSS `translate-y` com transition para entrada suave
- Conteúdo com `rounded-t-2xl` para visual de sheet

**3. `src/components/customize/MobileTabBar.tsx`**
- Adicionar indicador visual de tab ativa (underline ou dot) para feedback mais claro
- Manter `border-t` para separar visualmente do ContinueBar

### Layout resultante (mobile)

```text
┌─────────────────────────┐
│ Header                  │
├─────────────────────────┤
│                         │
│   Phone Preview         │
│   (sempre visível)      │
│                         │
│                         │
├─── rounded-t-2xl ───────┤  ← overlay sobe daqui (slide-up)
│ [x] Filtros IA          │
│                         │
│ conteúdo scrollável     │
│ (~60% da tela)          │
│                         │
├─────────────────────────┤
│ [Ajustes][Filtros][Gal] │  ← fixo acima do ContinueBar
├─────────────────────────┤
│ [↺]  [Finalizar →]     │  ← fixo no bottom
└─────────────────────────┘
```

### Detalhes técnicos
- Overlay usa `fixed bottom-0 left-0 right-0 h-[60vh]` com `transform translate-y-0` (aberto) / `translate-y-full` (fechado) e `transition-transform duration-300`
- Backdrop separado com `fixed inset-0 bg-black/30` que fecha ao clicar
- Tab bar e ContinueBar ficam com `z-60` para ficar acima do overlay
- Conteúdo do overlay com `overflow-y-auto` e `rounded-t-2xl`

