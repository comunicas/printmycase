

## Problema na modal de boas-vindas

A modal `IntroDialog` está com problema visual no mobile (390px):

### Sintomas observados na screenshot
1. **Modal cortada no topo** — o conteúdo "Bem-vindo ao Studio PrintMyCase" aparece colado no topo da tela, sem padding/margem superior adequada
2. **Toast "Rascunho restaurado" sobreposto** — aparece por cima da modal, atrapalhando a leitura
3. **Botões "Anterior" e "Próximo" cortados** — ficam escondidos atrás da barra inferior fixa (TabBar com Ajustes/Filtros IA/Galeria + botão Finalizar)
4. **Largura/altura inadequadas** — a modal parece ter altura fixa que não respeita o espaço da barra inferior fixa (`MobileTabBar` + `ContinueBar`)

### Causa raiz suspeita
A página `Customize.tsx` tem uma barra inferior fixa (`lg:hidden flex-shrink-0 relative z-[60]`) com `MobileTabBar` + `ContinueBar` ocupando ~140px na base. A `IntroDialog` provavelmente usa o componente Dialog padrão do Radix que centraliza com `position: fixed inset-0`, mas não considera essa barra inferior, fazendo os controles de navegação do carrossel ("Anterior"/"Próximo") ficarem escondidos.

Além disso, o toast de "Rascunho restaurado" dispara automaticamente ao montar a página, aparecendo simultaneamente com a IntroDialog.

### Investigação necessária antes de corrigir
Preciso ler:
- `src/components/customize/IntroDialog.tsx` — entender estrutura/altura da modal
- `src/hooks/useCustomize.tsx` — confirmar de onde vem o toast "Rascunho restaurado" e se podemos suprimir quando IntroDialog está aberta

### Plano de correção (proposto)

1. **Ajustar `IntroDialog` para mobile**:
   - Adicionar `max-h-[calc(100dvh-180px)]` para reservar espaço para a barra inferior fixa
   - Ajustar posicionamento vertical (centralizar acima da barra) com `top-[40%]` ou `mb-[160px]`
   - Garantir padding interno adequado para que botões "Anterior/Próximo" fiquem visíveis

2. **Suprimir toast "Rascunho restaurado" quando IntroDialog está visível**:
   - Passar flag `showIntro` para `useCustomize` ou atrasar o toast com `setTimeout` até a modal fechar
   - Alternativa mais simples: não mostrar o toast quando `!localStorage.getItem("customize_intro_seen")` (primeira visita)

3. **Z-index review**: garantir que IntroDialog (Radix Dialog padrão usa z-50) fique acima do toast (`z-[100]` no Toaster) — pode ser necessário aumentar para `z-[110]`

### Resultado esperado
- Modal centralizada e totalmente visível acima da barra inferior fixa
- Botões de navegação do carrossel acessíveis
- Sem sobreposição com toast de rascunho restaurado

