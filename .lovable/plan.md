
Objetivo: ampliar o plano anterior do `TermsDialog` para não só corrigir fullscreen e z-index no mobile, mas também refinar a UX da modal, reduzir a densidade de texto e tornar a leitura/decisão mais rápida sem perder a proteção jurídica essencial.

## O que será alterado

### 1) Corrigir fullscreen real e hierarquia de camadas
A base do dialog será ajustada para que a modal de termos fique acima de toda a UI fixa do mobile.

Implementação:
- elevar `DialogOverlay` e `DialogContent` acima do bloco mobile com `z-[60]`
- garantir overlay cobrindo toda a viewport
- manter content acima do overlay
- preservar o padrão do projeto:
  - mobile = fullscreen, cantos retos
  - desktop = card central arredondado

Arquivos:
- `src/components/ui/dialog.tsx`
- `src/components/customize/TermsDialog.tsx`

### 2) Transformar a modal em tela full screen de verdade no mobile
O `TermsDialog` deixará de parecer um card esticado e passará a funcionar como uma tela mobile dedicada.

Estrutura:
```text
[topo fixo]
- título
- subtítulo curto
- fechar

[conteúdo rolável]
- aviso curto
- lista resumida de proibições
- bloco final de responsabilidade

[rodapé fixo]
- cancelar
- aceitar
```

Resultado:
- leitura mais escaneável
- botões sempre visíveis
- sem competição com footer/continue bar do app

### 3) Refinar a copy e reduzir a quantidade de texto
O conteúdo atual será resumido para uma versão mais objetiva, mantendo as regras centrais.

Direção de copy:
- trocar parágrafos longos por bullets curtos
- remover repetições
- manter tom claro, firme e confiável
- destacar só o que importa para decisão rápida

Estrutura sugerida:
- introdução curta: “Antes de enviar sua imagem, confirme que o conteúdo é permitido.”
- 3 regras principais em lista:
  - marcas/logos apenas se forem seus
  - proibido usar famosos, times, filmes, séries, músicas e obras protegidas
  - proibido conteúdo ofensivo, violento, pornográfico ou discriminatório
- bloco final resumido:
  - “Você é responsável pelo conteúdo enviado. Personalizações fora das regras podem ser canceladas.”

Isso preserva o requisito legal da memória do projeto, mas melhora bastante a UX.

### 4) Melhorar hierarquia visual e legibilidade
A modal será refinada para parecer mais premium e mais rápida de entender.

Ajustes previstos:
- título forte + subtítulo curto
- ícone menor e menos dominante
- espaçamento mais controlado
- uso de lista com ícones/checks/alertas discretos
- bloco final de responsabilidade destacado visualmente
- largura de leitura confortável no desktop
- área de rolagem só no conteúdo, não no modal inteiro

### 5) Refinar microinterações e ações
As ações finais também serão melhoradas para clareza.

Direção:
- CTA principal mais direto, por exemplo:
  - `Entendi e continuar`
- ação secundária:
  - `Cancelar`
- foco visível claro
- animação de entrada/saída consistente com o restante dos dialogs
- fechamento por toque fora permanece apenas se isso não conflitar com a intenção jurídica atual; se necessário, manter fechamento explícito por cancelar/close

### 6) Melhorar a percepção de segurança sem assustar
A modal deve comunicar responsabilidade sem parecer excessivamente burocrática.

Ajustes de UX:
- reduzir caixa alta e blocos densos
- trocar “IMPORTANTE” longo por card/resumo objetivo
- manter linguagem simples
- priorizar leitura em menos de 10 segundos

## Arquivos impactados

### `src/components/ui/dialog.tsx`
Será ajustado para:
- subir z-index global do overlay e content
- manter animações consistentes e fullscreen mobile estável

### `src/components/customize/TermsDialog.tsx`
Será ajustado para:
- layout fullscreen real no mobile
- header/body/footer bem definidos
- texto resumido e reorganizado
- melhor hierarquia visual e botões fixos no rodapé

## Abordagem de implementação
1. Corrigir a camada do dialog para vencer toda a UI fixa mobile.
2. Reestruturar o `TermsDialog` como tela fullscreen no mobile.
3. Reescrever a copy em formato mais curto e escaneável.
4. Destacar responsabilidade final em um bloco visual simples.
5. Refinar espaçamento, foco visível e CTA principal.
6. Manter desktop intacto como card central.
7. Validar no viewport mobile atual para garantir cobertura total e melhor leitura.

## Check final documentado

### Fullscreen e camadas
- modal cobre 100% da tela no mobile
- footer/tab bar não aparece por cima
- z-index está correto em overlay e content

### UX e conteúdo
- texto ficou mais curto e mais claro
- regras principais podem ser entendidas rapidamente
- responsabilidade final continua explícita
- botões ficam sempre acessíveis

### Visual
- modal parece tela dedicada no mobile
- desktop continua como card central refinado
- animações e foco visível permanecem consistentes

## Resultado esperado
Depois do ajuste, a modal de termos ficará realmente fullscreen no mobile, visualmente mais limpa e hierarquizada, com texto resumido e mais fácil de entender. O usuário conseguirá ler rapidamente as regras, entender sua responsabilidade e concluir a ação sem fricção desnecessária.
