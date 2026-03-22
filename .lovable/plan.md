

## Corrigir direção invertida do arraste de imagem

### Causa raiz

O `background-position` em CSS funciona assim: `0%` mostra o início (esquerda/topo) da imagem, `100%` mostra o final (direita/baixo). Quando o usuário arrasta para a direita, `dx` é positivo, e o código faz `x = start - dx` (diminui), o que deveria mover a imagem para a direita.

**Porém**, a imagem está renderizada dentro de um container **oversized** (150%+ do tamanho do phone), posicionado com offsets negativos. Isso inverte o efeito visual do `background-position` — o que resulta no comportamento contrário ao esperado pelo usuário.

### Correção

Trocar o sinal de `-` para `+` nos cálculos de posição em **ambos** os handlers (pointer e touch):

**`src/components/PhonePreview.tsx`**

1. **Linha 82-84** (pointer/desktop): `x: start - dx` → `x: start + dx`, `y: start - dy` → `y: start + dy`
2. **Linha 142-144** (touch/mobile): mesma inversão de sinal

### Arquivos afetados
- `src/components/PhonePreview.tsx` — 2 blocos (4 linhas)

