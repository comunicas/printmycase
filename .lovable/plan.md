

## Refinar visual do InstagramShowcase — Minimalista

### O que muda

**1 arquivo editado: `src/components/InstagramShowcase.tsx`**

Simplificar ao máximo:
- Remover o heading "Siga a PrintMyCase no Instagram" e o subtítulo
- Remover `ScrollReveal` (animações desnecessárias para minimalismo)
- Manter apenas os embeds nativos (vídeo/post) em grid limpo
- Manter o link `@printmycasebr` no final, discreto
- Remover background `bg-muted/30` — fundo transparente
- Reduzir padding vertical
- Grid: 3 colunas desktop, scroll horizontal mobile (sem mudança estrutural)

### Resultado visual

```text
┌─────────────────────────────────────────────┐
│  [embed 1]    [embed 2]    [embed 3]        │
│                                             │
│            @printmycasebr                   │
└─────────────────────────────────────────────┘
```

Apenas os embeds nativos do Instagram (com vídeo interativo) e o link do perfil embaixo. Nada mais.

