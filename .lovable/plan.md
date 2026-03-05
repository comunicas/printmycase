

## Refinamento UX: Seções "Benefícios" e "Como Funciona"

### Diagnóstico atual

Ambas as seções usam cards simples e planos --- sem hierarquia visual forte, sem interatividade, e sem elementos criativos que reforcem a marca. Os benefit cards são `bg-muted/40` sem borda nem sombra. Os steps do "Como funciona" são ícones soltos sem conexão visual entre si.

### Alterações propostas

**1. Benefits cards --- elevação com hover e accent border**

- Adicionar `group` + hover: `hover:shadow-lg hover:-translate-y-1 transition-all duration-300`
- Borda sutil com accent na lateral esquerda: `border-l-4 border-l-primary/60` para criar hierarquia
- Ícone com fundo gradiente em vez de flat: `bg-gradient-to-br from-primary/20 to-primary/5`
- Ícone escala ao hover do card: `group-hover:scale-110 transition-transform`
- Manter o layout clean, sem excessos

**2. "Como funciona" --- connector lines entre steps + cards com fundo**

- Envolver cada step em um card com `bg-muted/30 rounded-2xl p-6` para dar corpo
- Adicionar linhas conectoras (dashed) entre os steps via pseudo-elemento CSS ou um `<div>` decorativo com `border-dashed` entre as colunas (visível apenas em desktop)
- Número badge com gradiente primary em vez de `bg-foreground` para consistência
- Hover sutil: `hover:bg-muted/50 transition-colors`

**3. Connector line approach**

Usar um componente separador horizontal com seta entre cada coluna no grid, visível apenas em `md:` breakpoint. Implementado como elementos `hidden md:flex` entre os cards, usando `border-t-2 border-dashed border-primary/30` com um chevron.

Alternativa mais clean: dentro do grid 3-col, adicionar `relative` e usar `after:` pseudo no CSS para desenhar a linha. Vou usar a abordagem inline com `ArrowRight` icons entre os steps para simplicidade.

### Arquivos editados

- **`src/pages/Landing.tsx`** --- refinar classes dos benefit cards e steps cards, adicionar connector arrows

Um único arquivo editado, mudanças puramente de styling e layout.

