

# Refinar UX da página de Confirmação de Compra

A tela atual já funciona (como mostra o screenshot), mas pode ser melhorada visualmente para transmitir mais confiança e celebração.

## Melhorias propostas

### 1. Adicionar logo ArtisCase acima do ícone de sucesso
Reforçar a marca na tela de confirmação, como feito em Login/Signup.

### 2. Animação sutil no ícone de check
Adicionar uma animação de escala/fade-in no ícone verde ao carregar a página (via CSS `animate-in`).

### 3. Melhorar hierarquia visual
- Aumentar o ícone de check (w-20 h-20 no circle, w-10 h-10 no ícone)
- Adicionar um card com borda suave ao redor do conteúdo para destacar do fundo
- Separar visualmente o código de referência com um divider

### 4. Mensagem mais detalhada
- Adicionar texto secundário: "Acompanhe o status do seu pedido na página Meus Pedidos"
- Mover referência para dentro de um badge/chip mais elegante

### 5. Botões com melhor destaque
- "Meus Pedidos" como botão principal (preenchido)
- "Voltar ao Catálogo" como secundário (outline)
- Inverter a ordem atual para guiar o usuário para acompanhar o pedido

## Arquivo afetado
- `src/pages/CheckoutSuccess.tsx` — redesign do layout e conteúdo

