
## Tornar UploadSpotlight fullscreen no mobile

Aplicar o mesmo padrão da `IntroDialog`: fullscreen no mobile, card centralizado no desktop.

### Mudança em `src/components/customize/UploadSpotlight.tsx`

Card interno (linha 15) — alterar classes para:
- **Mobile**: ocupar tela inteira (`w-screen h-[100dvh] rounded-none mx-0 p-6 justify-center`)
- **Desktop**: manter card atual (`sm:w-full sm:h-auto sm:max-w-sm sm:rounded-2xl sm:mx-4 sm:p-8 sm:justify-start`)

Adicionar `pb-[max(2rem,env(safe-area-inset-bottom))]` no mobile para safe area.

Manter o ícone, título, descrição e botões inalterados — apenas o container vira fullscreen com conteúdo verticalmente centralizado.

### Verificação
Abrir `/customize/galaxy-a23` (sem rascunho/foto) no mobile (390x844) e confirmar:
- Modal cobre 100% da tela, sem cantos arredondados
- Conteúdo centralizado verticalmente
- Botão "Escolher foto" e "Ou escolha da galeria" visíveis acima da safe area
- Desktop permanece com card centralizado
