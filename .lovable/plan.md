

## Novo modulo "ArtisCoins + IA" na Landing Page

### Objetivo
Criar uma seção visualmente impactante na home que explique o sistema de moedas (ArtisCoins) para customizar cases com filtros de IA, usando as imagens de referencia como showcase e um CTA forte para cadastro gratuito.

### Posicionamento
Inserir entre "Modelos em Destaque" e "Print Technology" — momento ideal pois o usuario ja viu os produtos e agora descobre o diferencial IA.

### Layout e Design

```text
┌─────────────────────────────────────────────────┐
│  bg-gradient (dark/primary)                     │
│                                                 │
│  ✨ Transforme sua foto com IA                  │
│  "Aplique filtros artísticos incríveis..."      │
│                                                 │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐     │
│  │ img │ │ img │ │ img │ │ img │ │ img │      │
│  │ case│ │ case│ │ case│ │ case│ │ case│      │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘     │
│  (carousel/grid das 5 imagens de referência)    │
│                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐     │
│  │🪙 50     │  │🎨 +20    │  │⚡ 10/    │     │
│  │ grátis   │  │ filtros  │  │ filtro   │     │
│  │ cadastro │  │ artístic.│  │          │     │
│  └──────────┘  └──────────┘  └──────────┘     │
│                                                 │
│  [ Cadastre-se Grátis e Ganhe 50 🪙 ]          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Implementacao

**Novo componente**: `src/components/AiCoinsSection.tsx`
- Seção com fundo gradiente escuro (consistente com hero dark aesthetic)
- Titulo: "Transforme qualquer foto em arte com IA"
- Subtitulo: copy sobre filtros artisticos e moedas
- Grid/carousel horizontal com as 5 imagens de cases uploadadas (copiar para `public/lovable-uploads/`)
- 3 cards informativos em linha: "50 moedas gratis no cadastro", "+20 filtros artisticos", "10 moedas por filtro"
- CTA principal: "Cadastre-se Gratis e Ganhe 50 🪙" → navega para `/signup`
- CTA secundario: "Saiba mais sobre ArtisCoins" → navega para `/coins`
- Usa `ScrollReveal` para animacoes consistentes

**Editar**: `src/pages/Landing.tsx`
- Importar `AiCoinsSection`
- Inserir entre Featured Products e PrintTechSection (linha ~207)

### Copy proposta
- Titulo: **"Transforme qualquer foto em arte com IA"**
- Sub: "Use filtros artísticos inteligentes para criar cases únicas. Pop art, 3D, cartoon e muito mais — tudo com um clique."
- Cards: "50 moedas grátis" / "+20 estilos artísticos" / "10 moedas por filtro"
- CTA: "Cadastre-se Grátis e Ganhe 50 🪙"

