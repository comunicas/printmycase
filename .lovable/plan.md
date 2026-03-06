

## Plano: Simplificar Customização — Apenas Mockup + Upload + Posição/Zoom

### O que muda

Remover filtros e ajustes (brilho, contraste, rotação). Manter apenas:
- Mockup do celular com upload de imagem
- Posicionamento por drag (mouse/touch)
- Zoom (escala) via slider simples ou scroll/pinch
- Barra fixa com preço + "Continuar"

### Arquivos

| Arquivo | Ação |
|---|---|
| `src/pages/Customize.tsx` | Remover imports/estados de filtros, brilho, contraste, rotação, activeFilter. Remover `FilterPresets` e `ControlPanel`. Simplificar `renderSnapshot` (sem filtro/rotação). Adicionar slider de zoom inline simples. Simplificar draft save/restore. |
| `src/components/PhonePreview.tsx` | Remover props `rotation`, `brightness`, `contrast`, `extraFilter`. Simplificar `imageLayerStyle` (sem rotação/filtro). Remover lógica trigonométrica do drag (sem rotação, drag direto). |
| `src/components/ControlPanel.tsx` | **Deletar** — não mais utilizado |
| `src/components/FilterPresets.tsx` | **Deletar** — não mais utilizado |

### Layout resultante (mobile)

```text
┌──────────────────────────────┐
│  AppHeader                   │
├──────────────────────────────┤
│                              │
│   ┌────────────────────┐     │
│   │   PhonePreview     │     │  ← drag para posicionar
│   │   (upload + drag)  │     │
│   └────────────────────┘     │
│                              │
│   [──────○──────] Zoom       │  ← slider simples
│                              │
├──────────────────────────────┤
│ ▓▓ R$XX,XX    [Continuar →] │  ← barra fixa
└──────────────────────────────┘
```

### Detalhes técnicos

- `DEFAULTS` reduz para `{ scale: 100, position: { x: 50, y: 50 } }`
- `renderSnapshot` simplifica: sem filtro CSS, sem rotação, apenas scale + position
- `PhonePreview` props: `image`, `scale`, `position`, `onPositionChange`, `onImageUpload`, `modelName`, `imageResolution`, `isProcessing`
- Drag no `PhonePreview`: remove compensação trigonométrica (sem rotação), fica apenas dx/dy direto
- Slider de zoom fica inline no `Customize.tsx` com o componente `Slider` existente, abaixo do mockup
- `isModified` simplifica para checar apenas `scale !== 100 || position !== center`

