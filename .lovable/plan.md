
Objetivo: refinar o `TermsDialog` para ficar mais confortável no mobile e adotar fullscreen como padrão em todos os dispositivos, sem card central no desktop/tablet.

## O que será alterado

### 1) Fullscreen em todos os breakpoints
O `TermsDialog` deixará de usar comportamento híbrido mobile fullscreen + desktop card e passará a abrir sempre como tela/modal fullscreen.

Implementação:
- remover classes responsivas que recentralizam e limitam o dialog em `sm+`
- manter `inset-0`, `h-[100dvh]`, `w-screen`, `max-w-none`, `rounded-none`
- eliminar `sm:max-w-md`, `sm:max-h-[90dvh]`, `sm:rounded-lg`, `sm:border`, `sm:translate-*`

Resultado:
- mesma experiência visual em mobile, tablet e desktop
- leitura mais consistente entre dispositivos
- modal sempre acima de toda a interface, sem competir com a área de customização ao fundo

### 2) Refinar o espaçamento mobile
O layout interno será ajustado para ficar menos apertado e mais equilibrado no mobile.

Direção:
- reduzir sensação de “caixa espremida”
- dar mais respiro vertical entre header, descrição, lista e bloco final
- ajustar paddings para leitura mais confortável em telas pequenas
- melhorar alinhamento entre ícones, títulos e linhas de texto
- revisar altura e espaçamento do footer para os botões não parecerem colados

Ajustes previstos:
- header com padding mais consistente
- body com espaçamento vertical levemente mais generoso
- lista de regras com menor ruído visual e melhor ritmo
- footer com paddings mais estáveis e separação clara do conteúdo

### 3) Refinar a UX do fullscreen no desktop/tablet
Como fullscreen passará a ser o padrão geral, a modal será tratada como uma “tela de confirmação” e não como um card ampliado.

Implementação:
- largura de leitura controlada dentro do fullscreen, sem recentralizar como popup pequeno
- conteúdo principal em coluna com área rolável central
- header fixo no topo e footer fixo na base
- manter o conteúdo escaneável e não excessivamente largo em desktop

Estrutura:
```text
[topo fixo com título + descrição + fechar]
[corpo rolável com regras resumidas]
[rodapé fixo com cancelar + CTA principal]
```

Resultado:
- fullscreen sem parecer vazio ou desproporcional
- melhor conforto de leitura em telas grandes
- decisão rápida e clara em qualquer dispositivo

### 4) Preservar hierarquia de camadas e comportamento atual
A correção de z-index já planejada/necessária será mantida como parte da solução.

Garantias:
- overlay continua cobrindo toda a interface
- content continua acima do overlay
- footer fixo, tabs mobile, continue bar e outros elementos não aparecem sobre a modal
- comportamento jurídico/funcional permanece igual: aceite obrigatório no primeiro upload da sessão

## Arquivos impactados

### `src/components/customize/TermsDialog.tsx`
Será ajustado para:
- remover o modo card em `sm+`
- manter fullscreen em todos os breakpoints
- refinar paddings, gaps e largura útil de leitura
- melhorar o ritmo visual do conteúdo e dos botões

### `src/components/ui/dialog.tsx`
Será revisado para:
- garantir que o `DialogContent` base não force recentralização/cantos arredondados no caso dessa modal
- preservar z-index correto e animações consistentes para a experiência fullscreen

## Abordagem de implementação
1. Remover as classes responsivas de card do `TermsDialog`.
2. Garantir fullscreen real em mobile, tablet e desktop.
3. Refinar paddings e espaçamentos internos para melhorar conforto visual no mobile.
4. Ajustar a largura útil do conteúdo dentro do fullscreen para não ficar nem apertado nem largo demais.
5. Validar que header e footer permanecem fixos e que o corpo continua rolável.
6. Confirmar que a hierarquia visual e o bloqueio da interface ao fundo continuam corretos.

## Check final documentado

### Fullscreen
- modal ocupa 100% da viewport em mobile, tablet e desktop
- não existe mais versão em card central
- cantos retos em todos os dispositivos

### Espaçamento e UX
- header respira melhor no mobile
- lista de regras fica mais fácil de ler
- footer não fica apertado
- conteúdo continua rápido de entender

### Camadas
- nada da interface aparece por cima
- overlay e content mantêm precedência correta

## Resultado esperado
Depois do ajuste, a modal de termos passa a usar fullscreen como padrão em qualquer dispositivo e ganha um refinamento de espaçamento no mobile, ficando mais limpa, mais confortável de ler e mais consistente com a importância da ação.
