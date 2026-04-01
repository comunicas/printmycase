

## Intro Tutorial — Modal com Carrossel na Página de Customização

### Conceito
Um Dialog modal com 4-5 slides ilustrativos que aparece automaticamente na primeira visita à página `/customize/*`. Cada slide explica um passo do fluxo (upload → ajustes → filtros IA → galeria → finalizar compra). O estado "já viu" é salvo em `localStorage`. Um link "Como funciona?" no header permite reassistir.

### Mudanças

**1. Novo componente: `src/components/customize/IntroDialog.tsx`**
- Dialog modal usando `@/components/ui/dialog`
- Carrossel com 4-5 slides, cada um com ícone (Lucide), título curto e descrição de 1 linha:
  1. **Envie sua imagem** — Upload ou tire uma foto do celular
  2. **Ajuste posição e tamanho** — Arraste, redimensione e rotacione
  3. **Aplique Filtros IA** — Transforme sua imagem com estilos artísticos
  4. **Escolha da Galeria** — Use uma imagem pronta da nossa galeria
  5. **Finalize a compra** — Clique em Continuar para concluir
- Indicadores de progresso (dots) + botões Próximo/Anterior
- Botão "Entendi!" no último slide fecha e salva `localStorage.setItem("customize_intro_seen", "true")`
- Props: `open`, `onOpenChange`

**2. `src/pages/Customize.tsx`**
- Adicionar state `showIntro` — inicializa como `!localStorage.getItem("customize_intro_seen")`
- Renderizar `<IntroDialog open={showIntro} onOpenChange={setShowIntro} />`

**3. `src/components/customize/CustomizeHeader.tsx`**
- Adicionar prop `onShowIntro`
- Adicionar ícone `HelpCircle` (Lucide) como botão ao lado do seletor de modelo ou do CoinBalance
- Ao clicar, chama `onShowIntro()` para reabrir o modal

### Detalhes técnicos
- localStorage key: `customize_intro_seen`
- Sem dependência de banco — funciona offline e sem autenticação
- Animação simples de slide horizontal entre os passos via CSS transform
- 3 arquivos: 1 novo + 2 editados
- Zero impacto em performance (componente leve, renderizado sob demanda)

