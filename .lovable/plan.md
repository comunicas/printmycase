

## Fullscreen Overlay para Tabs no Mobile

### Conceito

Em vez de empilhar tabs abaixo do preview (competindo por espaço), cada tab abre como um **overlay fullscreen semi-transparente** sobre o preview. O smartphone fica sempre fixo e centralizado como referência visual, visível por trás do overlay.

```text
┌─────────────────────────┐
│ Header (40px)           │
├─────────────────────────┤
│                         │
│   [Phone Preview fixo]  │  ← sempre visível, centralizado
│                         │
│  ┌───────────────────┐  │
│  │ Overlay (bg/80)   │  │  ← abre ao tocar na tab
│  │ [x fechar]        │  │
│  │ Conteúdo scroll   │  │
│  │ (filtros/galeria) │  │
│  └───────────────────┘  │
│                         │
├─────────────────────────┤
│ [Ajustes] [Filtros] [G] │  ← tab bar fixa no bottom
├─────────────────────────┤
│ [Finalizar →]           │
└─────────────────────────┘
```

### Comportamento

- **Tab bar compacta** fixa acima do ContinueBar (apenas ícones + label curto)
- Tocar numa tab abre o conteúdo como overlay animado (slide-up) com fundo `bg-background/90 backdrop-blur`
- O phone preview continua visível por trás, semi-transparente
- Botão **X** ou toque fora fecha o overlay
- **Tab Ajustes** abre overlay compacto com slider de zoom + botões (Girar, Expandir, Upscale)
- **Tab Filtros IA** abre overlay scrollável com o grid de filtros (3 colunas no mobile para thumbnails maiores)
- **Tab Galeria** abre overlay com as galerias/imagens
- No **desktop (lg+)** nada muda — mantém sidebar lateral atual

### Alterações por arquivo

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Customize.tsx` | Remover wrapper de tabs mobile atual; adicionar estado `activeTab` e renderizar overlay condicionalmente |
| `src/components/customize/ImageControls.tsx` | Extrair para dois componentes: `MobileTabBar` (barra de ícones) + `MobileTabOverlay` (overlay fullscreen); manter versão desktop intacta |
| `src/components/customize/AiFiltersList.tsx` | Ajustar grid para 3 colunas no mobile (`grid-cols-3 sm:grid-cols-4`) |
| `src/components/PhonePreview.tsx` | Nenhuma mudança estrutural — apenas herda o espaço extra disponível |

### Detalhes técnicos

- Overlay usa `fixed inset-0` com `z-50`, animação `animate-in slide-in-from-bottom` do Tailwind
- Fundo `bg-background/90 backdrop-blur-md` para manter preview visível
- Conteúdo do overlay com `overflow-y-auto` e `max-h` calculado para respeitar header + tab bar + continue bar
- Fechar overlay ao selecionar imagem da galeria ou aplicar filtro (feedback imediato)
- Tab bar usa `grid-cols-3` com ícones de 20px + label de 10px

