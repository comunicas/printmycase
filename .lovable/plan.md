

## Animação Fade-in no Zoom + Corrigir Textos

### Alterações

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `src/pages/DesignPage.tsx` | Trocar textos "Passe o mouse para ampliar" → "Clique para ampliar" (linhas 202-207, 251-252). Adicionar classes de animação no overlay de zoom: `animate-fade-in` no backdrop e `animate-scale-in` na imagem (linhas 290-301). |
| 2 | `src/index.css` | Adicionar keyframes `zoom-backdrop` (opacity 0→1, 200ms) e `zoom-img` (opacity 0→1 + scale 0.92→1, 200ms) com classes `.animate-zoom-backdrop` e `.animate-zoom-img`. |

### Textos corrigidos
- Desktop: "Passe o mouse para ampliar" → "Clique para ampliar"
- Mobile: "Toque para ampliar" → mantém (já correto)
- Device card desktop: "Passe o mouse para ampliar" → "Clique para ampliar"

### Overlay animado
```text
backdrop: animate-zoom-backdrop (fade 200ms)
imagem:   animate-zoom-img (fade + scale 0.92→1, 200ms ease-out)
```

