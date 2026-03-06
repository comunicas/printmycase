

## Simplificar seção ArtisCoins — remover detalhes de custo

### O que muda

**Remover**: Os 3 info cards (50 moedas grátis, +20 estilos, 10 moedas por filtro) e o botão "Saiba mais sobre ArtisCoins". Toda menção a custo por geração sai.

**Simplificar copy**:
- Badge: "Novidade — IA Artística" (sem mencionar coins)
- Título: "Transforme qualquer foto em arte com IA" (mantém)
- Subtítulo: "Aplique filtros artísticos com um clique. Pop art, 3D, cartoon e muito mais. Cadastre-se grátis e comece agora."
- CTA único: "Cadastre-se Grátis" → `/signup`

**Resultado**: Seção mais limpa — marquee de imagens + copy curta + 1 CTA. Sem números, sem detalhes de moedas.

### Arquivo alterado
`src/components/AiCoinsSection.tsx` — remover `infoCards`, simplificar header copy, reduzir CTAs para um único botão.

