

## Refatoração: Seção "Por que ArtisCase" — Copy Unificada + CTA

### Mudanças

**1. Reescrever copy do `WhyArtisCase.tsx`**

Unificar proteção + impressão em 2 cards (em vez de 3 separados) + manter Entrega Rápida. Remover toda a subsection de "Tecnologia de Impressão" com os 4 tech attributes e o video/modal do YouTube.

**Novos cards (2 principais + 1 entrega):**

| Card | Titulo | Copy |
|------|--------|------|
| Shield | Proteção Real | Policarbonato rígido absorve impactos. TPU flexível protege contra quedas e arranhões. Acabamento soft-touch que não escorrega. |
| Palette | Impressão UV Epson | Tecnologia Micro Piezo sem aquecimento: cores vibrantes e detalhes nítidos que não desbotam. Sua arte ganha vida exatamente como você imaginou. |
| Truck | Entrega Rápida | Produção em até 48h com embalagem reforçada. Frete acessível para todo o Sudeste. |

**Subtítulo da seção**: "Materiais premium e impressão profissional em cada case."

**2. Remover do componente:**
- `useState`, `Dialog`, `DialogContent`, `Play` imports
- `techAttributes` array
- `YOUTUBE_ID` constant
- Grid md:grid-cols-2 com tech list + video thumbnail
- Video modal Dialog inteiro
- Manter logos Epson + PrecisionCore abaixo dos cards

**3. Adicionar CTA abaixo dos logos:**
Botão "Crie sua Case →" que linka para `/catalog`, posicionado centralmente após os logos.

**4. Deletar `PrintTechSection.tsx`** (componente legado, não usado em nenhuma rota).

### Arquivos

| Arquivo | Ação |
|---------|------|
| `src/components/WhyArtisCase.tsx` | Reescrever — copy unificada, remover video/tech, adicionar CTA |
| `src/components/PrintTechSection.tsx` | Deletar — legado não usado |

