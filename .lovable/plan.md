

## Ajustar overlay gradient do hero

A imagem atual já tem tons roxos que combinam com a marca. O overlay pode ser refinado para realçar a imagem enquanto mantém a legibilidade.

### Mudanças em `src/pages/Landing.tsx` (linha 55)

**De:**
```
bg-gradient-to-b from-black/70 via-black/50 to-black/80
```

**Para:**
```
bg-gradient-to-b from-black/60 via-purple-950/40 to-black/75
```

Isso reduz levemente a opacidade no topo, adiciona um tom roxo sutil no meio (harmonizando com o fundo roxo da imagem), e mantém a base escura para contraste com a próxima seção.

Também ajustar o radial glow (linha 57-59) para aumentar levemente a intensidade:
- Opacidade de `0.35` → `0.40`

