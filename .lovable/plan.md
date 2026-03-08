

## Retaguamento da Landing Page — Correção de Layout

### Problemas identificados

1. **BUG GRAVE: Imagem hero `position: fixed` vaza por todas as seções.** O CSS `.parallax-bg > img` aplica `position: fixed` na imagem do hero, fazendo-a cobrir todo o viewport. As seções subsequentes (Como funciona, Modelos em Destaque) ficam com o fundo da hero visível por trás — exatamente o que aparece nos screenshots.

2. **`<Separator />` desnecessários** entre hero e seções criam linhas finas sem função visual.

3. **Backgrounds inconsistentes** — `bg-card` (`hsl(0 0% 98%)`) vs `bg-background` (`hsl(240 4% 95%)`) usados sem critério entre seções, criando variação sutil de tom.

4. **`-mt-[56px]` no hero** é frágil — depende da altura exata do header.

5. **FAQ usa `bg-muted/30`** enquanto outras seções usam `bg-card` — inconsistência visual.

### Alterações propostas

**Arquivo: `src/index.css`**
- Remover as regras `.parallax-bg > img { position: fixed }` e o fallback iOS. Substituir por `position: absolute` simples dentro do container. O efeito parallax via `background-attachment: fixed` no WhyArtisCase permanece intacto (usa CSS background-image, não img).

**Arquivo: `src/pages/Landing.tsx`**
- Remover `<Separator />` entre hero → "Como funciona" e entre "Como funciona" → "Modelos em Destaque" e entre "WhyArtisCase" → "Depoimentos".
- Padronizar todas as seções claras para `bg-background` (consistência).
- Remover wrapper `<div className="bg-black">` do AppHeader — mover para dentro da hero section.
- Substituir `-mt-[56px]` por uma abordagem onde o header fica DENTRO da hero section.

**Arquivo: `src/components/FaqSection.tsx`**
- Trocar `bg-muted/30` por `bg-background` para consistência com as demais seções.

### Resumo de impacto
- Zero mudança funcional ou de UX
- Corrige o bug visual grave do background vazando
- Remove código legado (parallax via fixed img)
- Padroniza backgrounds entre seções

