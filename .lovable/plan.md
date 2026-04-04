
## Remover bloco "Proteção e estilo em cada detalhe" (WhyPrintMyCase)

### O que será feito

**1. Deletar o componente `src/components/WhyPrintMyCase.tsx`**

**2. Editar `src/pages/Landing.tsx`**
- Remover import do `WhyPrintMyCase` (linha 16)
- Remover `<WhyPrintMyCase />` e o comentário associado (linhas 228-229)

**3. Limpar CSS órfão em `src/index.css`**
- Remover a classe `.parallax-bg` e seu bloco `@supports` (linhas 136-147), já que nenhum outro componente a utiliza

**4. Assets órfãos (opcionais para limpeza futura)**
- `src/assets/logo-epson.webp`, `src/assets/logo-precisioncore.webp`, `src/assets/printmycase-hero-optimized.webp` — só eram usados pelo WhyPrintMyCase

**5. Sem alterações em documentação**
- ARCHITECTURE.md e README.md não mencionam esse bloco, portanto não precisam de atualização

### Resultado
A landing page ficará: Hero → Como Funciona → Vitrine → AI Coins → Lojas → Depoimentos → FAQ → CTA Final
