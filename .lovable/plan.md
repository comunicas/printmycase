

## Revisao de Copy + Reorganizacao dos Blocos da Landing

### Ordem atual
1. Hero
2. Beneficios (Personalizada / Protecao / Envio)
3. Como funciona (3 steps)
4. Modelos em Destaque (produtos)
5. ArtisCoins + IA
6. Tecnologia de Impressao
7. Depoimentos
8. FAQ
9. CTA Final

### Nova ordem proposta (narrativa mais logica)
1. **Hero** — sem mudancas
2. **Como funciona** — move para cima, responde imediatamente "como eu faco?"
3. **Modelos em Destaque** — logo apos explicar o processo, o usuario ja ve opcoes
4. **ArtisCoins + IA** — diferencial criativo, mantém posicao apos produtos
5. **Beneficios / Atributos** — agora focados na qualidade do produto (merge com PrintTech em uma unica secao mais concisa)
6. **Depoimentos** — prova social reforça os atributos
7. **FAQ**
8. **CTA Final**

### Revisao de copy

**Como funciona** (steps atualizados para incluir IA):
1. "Escolha seu modelo" → "Encontre seu celular no catálogo"
2. "Envie sua imagem" → "Personalize com sua foto ou IA" (desc: "Faça upload e aplique filtros artísticos com ArtisCoins")
3. "Receba em casa" → sem mudanca

**Beneficios** (copy ajustada, foco no produto final):
- "Design Único" → "Sua foto ou arte, impressa com tecnologia PrintMyCase — a mesma das máquinas de shopping."
- "Proteção Real" → "Policarbonato rígido + TPU flexível. Protege contra quedas de até 1,5m com acabamento soft-touch."
- "Entrega Rápida" → "Produção em até 48h. Frete acessível para todo o Sudeste."

**Titulo da secao de beneficios**: "Por que escolher a ArtisCase?" (mais direto)

**PrintTechSection**: Removida como secao separada. Os atributos tecnologicos (Micro Piezo, Epson, video) sao incorporados dentro da secao de beneficios como um bloco complementar abaixo dos 3 cards, mantendo o video e logos.

### Arquivos alterados

| Arquivo | Alteracao |
|---|---|
| `src/pages/Landing.tsx` | Reordenar secoes, atualizar copy dos steps e benefits, incorporar PrintTechSection dentro da secao de beneficios |
| `src/components/PrintTechSection.tsx` | Pode ser mantido como componente standalone mas renderizado dentro da secao de beneficios, ou inlined — decisao de implementacao |

### Resultado
Fluxo narrativo: "veja como funciona" → "escolha seu modelo" → "descubra filtros IA" → "por que somos diferentes" (qualidade + tech + prova social) → FAQ → CTA

