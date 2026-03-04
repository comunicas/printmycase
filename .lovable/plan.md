

# Exigir imagem para habilitar controles e continuar

## Mudanças

### `src/pages/Customize.tsx`
- Passar prop `disabled={!image}` para `ControlPanel`, `FilterPresets` e o `Button` "Continuar"
- Tabs de Ajustes/Filtros ficam visualmente desabilitadas sem imagem

### `src/components/ControlPanel.tsx`
- Aceitar prop `disabled?: boolean`
- Quando `disabled`, sliders e botões de reset ficam desabilitados com opacidade reduzida

### `src/components/FilterPresets.tsx`
- Aceitar prop `disabled?: boolean`
- Quando `disabled`, thumbnails de filtro ficam não-clicáveis com opacidade reduzida

