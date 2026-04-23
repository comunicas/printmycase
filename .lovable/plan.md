
Objetivo: substituir o CTA textual de contato na experiência de customização por um ícone pequeno, nos pontos destacados nas imagens, deixando a interface mais limpa sem perder acesso rápido à página `/contato`.

## O que será alterado

### 1) Trocar o CTA textual do rodapé por ícone pequeno
Hoje o `ContinueBar` exibe o texto:
- `Precisando de ajuda? Fale Conosco`

Esse trecho será substituído por um CTA compacto em formato de ícone clicável.

Direção:
- remover a linha textual abaixo do botão `Finalizar`
- inserir um botão/link pequeno com ícone de ajuda/contato
- manter navegação para `/contato`
- preservar acessibilidade com `aria-label` e tooltip/título quando fizer sentido

Arquivo principal:
- `src/components/customize/ContinueBar.tsx`

### 2) Adicionar o mesmo CTA no topo da customização
No header da tela de customização será incluído um ícone pequeno de contato no lado direito, na área indicada nas imagens.

Direção:
- posicionar o ícone junto ao grupo atual do topo, sem competir com o botão de ajuda/tutorial e saldo
- manter tamanho discreto e alinhado ao visual existente
- usar comportamento consistente entre mobile e desktop
- linkar para `/contato`

Arquivo principal:
- `src/components/customize/CustomizeHeader.tsx`

### 3) Refinar o padrão visual do ícone
O CTA será tratado como ação secundária, não como destaque principal.

Direção visual:
- usar botão `ghost`/ícone pequeno
- cor neutra com hover sutil
- foco visível consistente
- área clicável confortável, mas sem “peso” visual
- manter estética clean e premium da customização

### 4) Garantir acessibilidade
Como o texto visível será removido, o CTA precisa continuar claro para teclado e leitores de tela.

Implementação planejada:
- `aria-label` descritivo, como `Falar com o suporte` ou `Abrir contato`
- `title`/tooltip opcional para reforçar entendimento visual
- foco visível com `focus-visible`
- manter como link real para `/contato`

## Arquivos impactados

### `src/components/customize/ContinueBar.tsx`
Será ajustado para:
- remover o texto “Precisando de ajuda? Fale Conosco”
- inserir CTA de contato por ícone no bloco inferior/mobile e versão inline/desktop
- preservar espaçamento do footer sem criar buracos visuais

### `src/components/customize/CustomizeHeader.tsx`
Será ajustado para:
- incluir ícone pequeno de contato no grupo de ações do topo
- equilibrar espaçamento com botão de ajuda e saldo de moedas

### `src/components/ui/tooltip.tsx`
Provavelmente não exigirá mudança estrutural, mas poderá ser reutilizado se o ícone receber tooltip.

## Abordagem de implementação
1. Criar um padrão compacto de link de contato por ícone.
2. Aplicar esse padrão no `ContinueBar` em vez do texto atual.
3. Aplicar o mesmo padrão no `CustomizeHeader`, nos locais indicados.
4. Ajustar espaçamento para evitar desalinhamento em mobile e desktop.
5. Garantir `aria-label`, foco visível e clique confortável.
6. Validar que o resultado fique discreto e claramente acionável.

## Check final documentado

### UX
- texto longo de contato sai do rodapé
- CTA fica mais limpo e menos intrusivo
- acesso ao contato continua rápido

### Posicionamento
- ícone aparece nos pontos indicados nas imagens
- não conflita com `Finalizar`, ajuda ou saldo
- layout continua equilibrado em mobile e desktop

### Acessibilidade
- ícone tem nome acessível
- foco visível funciona
- navegação por teclado continua correta

## Resultado esperado
Depois do ajuste, o contato na tela de customização deixará de ocupar uma linha textual no rodapé e passará a aparecer como um ícone pequeno e discreto, também presente no topo da interface, mantendo acesso rápido ao contato com uma UI mais limpa e refinada.
