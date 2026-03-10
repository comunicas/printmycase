

## Substituir o logo da ArtisCase em toda a plataforma

### Locais de uso do logo atual

1. **`src/assets/logo-artiscase.png`** — usado em Login, Signup, CheckoutSuccess
2. **`/lovable-uploads/79379ce7-...png`** — usado no AppHeader (header de todas as páginas)
3. **Footer** (`Landing.tsx`) — texto "ArtisCase" (sem imagem atualmente)
4. **Email templates** — referência a logo no storage (não será alterado agora, requer upload manual no storage)

### Plano

1. **Copiar** o novo logo para `src/assets/logo-artiscase.png` (substituir o arquivo existente) — será usado automaticamente em Login, Signup e CheckoutSuccess
2. **Copiar** o novo logo para `public/lovable-uploads/79379ce7-c6b3-4051-9947-c8dfc449251d.png` (substituir) — será usado automaticamente no AppHeader
3. **Footer** — substituir o texto "ArtisCase" por uma tag `<img>` com o novo logo importado de `src/assets/logo-artiscase.png`
4. **AppHeader** — remover o filtro `brightness-0 invert` no modo transparente, pois o novo logo já possui cores que funcionam em fundo escuro (gradiente roxo/magenta sobre fundo dark)

### Arquivos alterados
- `src/assets/logo-artiscase.png` — substituído pelo novo
- `public/lovable-uploads/79379ce7-c6b3-4051-9947-c8dfc449251d.png` — substituído pelo novo
- `src/pages/Landing.tsx` — footer com imagem ao invés de texto
- `src/components/AppHeader.tsx` — ajustar filtro CSS para modo transparente

