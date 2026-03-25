

## Unificar Blocos IA — AiCoinsSection + PublicGallerySection

### Objetivo
Fundir os dois blocos ("Novidade — IA Artística" e "Galeria de Inspiração") em um único bloco escuro. Remover o marquee de imagens estáticas e usar a galeria de gerações reais dos usuários como vitrine visual da seção.

### Alterações

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `AiCoinsSection.tsx` | Reescrever para incorporar a lógica da `PublicGallerySection`. Manter o visual escuro (dark bg + radial glow). Substituir o marquee de imagens estáticas por um grid masonry com as gerações públicas (`user_ai_generations` where `public = true`). Manter header ("Novidade — IA Artística" + título + descrição). CTA: "Crie a Sua" apontando para `/customize`. |
| 2 | `PublicGallerySection.tsx` | Deletar o componente (absorvido pelo `AiCoinsSection`). |
| 3 | `Landing.tsx` | Remover o import e uso de `<PublicGallerySection />`. O `<AiCoinsSection />` já está na landing e passa a conter tudo. |

### Estrutura do bloco unificado

```text
┌─────────────────────────────────────────────┐
│  [dark bg + radial glow]                    │
│                                             │
│  ✨ Novidade — IA Artística                 │
│  Transforme qualquer foto em arte com IA    │
│  Aplique filtros artísticos com um clique... │
│                                             │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ gen  │ │ gen  │ │ gen  │ │ gen  │  ...   │
│  │  1   │ │  2   │ │  3   │ │  4   │       │
│  └──────┘ └──────┘ └──────┘ └──────┘       │
│  (masonry grid, gerações reais dos users)   │
│                                             │
│         [ Crie a Sua → ]                    │
└─────────────────────────────────────────────┘
```

### Detalhes
- Grid masonry: `columns-2 md:columns-4`, aspect ratios variados (3/4, square, 4/5, 2/3)
- Imagens usam `public_image_url` com fallback `image_url`, `onError` para esconder quebradas
- Hover mostra nome do filtro (badge glass)
- Se não houver gerações públicas, mostra as 5 imagens showcase estáticas como fallback (marquee)
- Textos em branco (dark section): títulos `text-white`, subtítulos `text-white/70`

