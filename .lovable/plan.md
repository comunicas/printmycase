

## Adicionar tab "Galeria" no ImageControls

### Problema
Atualmente o GalleryPicker só abre via botão no PhonePreview. O usuário precisa de uma tab dedicada "Galeria" dentro do painel de controles (ImageControls) para navegar e escolher imagens diretamente, sem depender do dialog.

### Alterações

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | `src/components/customize/ImageControls.tsx` | Adicionar terceira tab "Galeria" com ícone `ImageIcon`. Renderizar um grid inline de galerias e imagens (similar ao GalleryPicker mas embutido na tab, não em dialog). Recebe `onGallerySelect` callback. |
| 2 | `src/components/customize/GalleryTab.tsx` | **Novo** — Componente inline que carrega galerias e imagens do banco. Mostra grid de galerias, ao clicar mostra imagens, ao clicar na imagem chama `onSelect(url)`. Sem dialog, renderiza direto na tab. |
| 3 | `src/pages/Customize.tsx` | Passar `onGallerySelect={c.handleGalleryImageSelect}` para ambos os `ImageControls` (mobile e desktop). |

### Comportamento
- Tab "Galeria" aparece sempre (não depende de `hasImage`), permitindo escolher imagem mesmo sem ter feito upload.
- Remove a restrição `opacity-50 pointer-events-none` para a tab Galeria quando não há imagem.
- Grid de galerias com cover image → clique abre grid de imagens → clique aplica imagem ao preview.
- Botão "Voltar" para retornar à lista de galerias.
- TabsList passa de `grid-cols-2` para `grid-cols-3` quando há filtros, ou `grid-cols-2` quando não há.

