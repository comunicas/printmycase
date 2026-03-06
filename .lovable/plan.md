

## Marquee automático + imagens 1:1 na seção ArtisCoins

### Alterações

**`src/components/AiCoinsSection.tsx`**
- Substituir o grid estático de imagens por um marquee infinito (CSS-only, sem biblioteca)
- Duplicar o array de imagens para criar loop contínuo seamless
- Forçar aspect-ratio 1:1 nas imagens com `aspect-square` + `object-cover`
- Pausar animação no hover para o usuário poder ver os detalhes

**`src/index.css`**
- Adicionar keyframe `marquee` para translação horizontal contínua
- Classe `.animate-marquee` com duração ~20s linear infinite

### Layout do marquee

```text
┌──────────────── viewport ─────────────────┐
│  [img1] [img2] [img3] [img4] [img5] [img1] [img2] [img3] [img4] [img5]  → scroll contínuo
└───────────────────────────────────────────┘
```

- Imagens: `w-36 sm:w-40 md:w-44` com `aspect-square rounded-2xl`
- Container com `overflow-hidden` e inner flex animado
- Hover no container pausa a animação (`hover:pause`)

