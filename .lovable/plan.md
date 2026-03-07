

## Diagnóstico: Seções afetadas pelo `bg-black`

A mudança de `bg-background` para `bg-black` no wrapper da Landing corrigiu a linha branca do header, mas afetou seções que **não definem seu próprio background** e dependiam do fundo claro herdado do pai. Aqui está o mapa completo:

### Seções que **JÁ TÊM** background próprio (não afetadas):
- **Hero** — gradientes escuros próprios
- **AiCoinsSection** — `bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950`
- **WhyArtisCase** — parallax bg com overlay `bg-black/75`
- **CTA final** — `bg-primary`

### Seções **AFETADAS** (herdavam `bg-background` claro, agora herdam `bg-black`):
1. **"Como funciona"** (linha 113) — `py-16 px-5` sem bg → texto e cards escuros sobre fundo preto
2. **"Modelos em Destaque"** (linha 149) — `py-16 px-5` sem bg → idem
3. **"Depoimentos"** (linha 184) — `bg-muted/30` → transparência sobre preto em vez de sobre branco
4. **FAQ** — `bg-muted/30` → idem
5. **Footer** — `bg-card` → cor do card pode estar ok, mas `border-t` pode parecer diferente

### Correção proposta

Em vez de `bg-black` no wrapper inteiro, a solução correta é manter `bg-background` no wrapper e aplicar `bg-black` apenas na área do hero. Isso restaura todas as seções claras sem reintroduzir a linha branca:

**`src/pages/Landing.tsx`**:
1. Reverter wrapper para `bg-background`
2. Na section do hero, adicionar um `<div className="bg-black">` envolvendo apenas o hero + header, ou adicionar `bg-black` diretamente na section do hero (que já tem `min-h-[100svh] -mt-[56px]`)

Concretamente:
- Linha 43: voltar para `className="min-h-screen bg-background flex flex-col"`
- O hero (linha 47) já cobre 100svh com overlays escuros, e o header com `-mt-[56px]` fica dentro dele. A linha branca aparecia porque o header sticky ficava **fora** do hero. A solução é adicionar um wrapper `bg-black` apenas ao redor do header + hero, não na página inteira.

Abordagem final:
- Wrapper da página: `bg-background`
- Envolver `<AppHeader>` + hero section num `<div className="bg-black">` para que o header transparente tenha fundo preto atrás dele, sem afetar o resto da página.

