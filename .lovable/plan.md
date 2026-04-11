

## Swipe-down para fechar + auto-fechar ao aplicar filtro

### Alteracoes em `src/components/customize/MobileTabOverlay.tsx`

**1. Gesto swipe-down no handle/header**
- Rastrear `touchStart.clientY` e `touchMove.clientY` na area do header (drag handle)
- Calcular `deltaY = touchMove.clientY - touchStart.clientY`
- Durante o arraste, aplicar `transform: translateY(${deltaY}px)` no sheet em tempo real (apenas valores positivos, ou seja, para baixo)
- No `touchEnd`: se `deltaY > 80px`, chamar `handleClose()`; senao, animar de volta para `translateY(0)`

**2. Auto-fechar ao clicar num filtro IA**
- Wrapper `onFilterClick` para chamar `handleClose()` apos disparar o filtro original
- Manter o mesmo comportamento ja existente para galeria (`handleGallerySelect` ja fecha)

### Detalhes tecnicos
- Usar `useRef` para armazenar `startY` e `currentDeltaY`
- Usar `useState` para `dragDeltaY` que controla o offset visual durante o arraste
- Aplicar `style={{ transform: translateY(${dragDeltaY}px) }}` inline durante o drag, voltando para classes CSS quando solto
- Desabilitar `transition-transform` durante o drag ativo para resposta imediata, reabilitar ao soltar
- Threshold de 80px para fechar, com velocidade do swipe como criterio secundario

