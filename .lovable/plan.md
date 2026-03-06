

## Plano: Refatorar Customizacao — Mobile-First com UX Otimizada

### Problema Atual

No mobile, a pagina de customizacao exibe o mockup do celular + controles em coluna, forçando scroll extenso. O botao "Continuar" fica escondido abaixo da dobra. Nao ha barra fixa de acoes, e o upload inicial nao e destacado como passo claro.

### Nova Estrutura de Layout

```text
┌──────────────────────────────┐
│  AppHeader (sticky)          │
├──────────────────────────────┤
│                              │
│   ┌────────────────────┐     │  ← Mockup centralizado
│   │   PhonePreview     │     │    (escala responsiva)
│   │   (touch-drag)     │     │
│   └────────────────────┘     │
│                              │
│   [Filtros] carrossel horiz  │  ← Sempre visivel
│   [Ajustes] colapsavel       │  ← Accordion, fecha por padrao
│                              │
├──────────────────────────────┤
│ ▓▓ Barra fixa bottom ▓▓▓▓▓▓ │  ← Preco + "Continuar" + Reset
│ ▓▓ R$XX,XX    [Continuar →] │
└──────────────────────────────┘

Desktop (lg+): lado a lado como hoje, mas botao fixo no bottom do painel
```

### Alteracoes Planejadas

#### 1. `Customize.tsx` — Layout mobile-first

- Mockup ocupa area principal com escala responsiva (menor em telas pequenas)
- Filtros logo abaixo do mockup, sempre visiveis
- ControlPanel envolto em Accordion (colapsado por padrao no mobile, expandido no desktop)
- Barra fixa no bottom do viewport (mobile): mostra preco do produto + botao "Continuar" + botao reset
- No desktop: manter layout side-by-side, botao "Continuar" fixo no bottom do painel direito
- Mostrar preco do produto na tela (buscar de `product.price`)

#### 2. `PhonePreview.tsx` — Upload simplificado

- Estado vazio (sem imagem): area de upload maior e mais clara, com CTA "Enviar sua foto" proeminente
- Reduzir tamanho do mockup no mobile (de 260x532 para ~220x450) via classes responsivas
- Manter tamanho original no desktop

#### 3. `ControlPanel.tsx` — Accordion no mobile

- Envolver em `Accordion` do Radix (ja instalado)
- Titulo "Ajustes" funciona como trigger
- Aberto por padrao no desktop (`defaultValue` condicional)

#### 4. Barra fixa de acao (novo componente ou inline)

- `fixed bottom-0` no mobile, com `safe-area-inset-bottom`
- Background com blur (`backdrop-blur`)
- Contem: preco formatado | botao "Continuar" (com icone) | botao reset (se modificado)
- Desaparece no desktop (controles ja visiveis no painel lateral)

### Arquivos Modificados

| Arquivo | Mudanca |
|---|---|
| `src/pages/Customize.tsx` | Layout responsivo, barra fixa, preco, accordion wrapper |
| `src/components/PhonePreview.tsx` | Classes responsivas de tamanho, upload CTA melhorado |
| `src/components/ControlPanel.tsx` | Envolver em Accordion para mobile |

### Detalhes Tecnicos

- Usar `@radix-ui/react-accordion` (ja instalado) para colapsar ajustes
- Barra fixa usa `pb-[env(safe-area-inset-bottom)]` para iPhones com barra de gestos
- Preco vem de `product.price` (ja disponivel no hook `useProduct`)
- Sem novas dependencias necessarias

