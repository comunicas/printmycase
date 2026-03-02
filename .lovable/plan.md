

# Redesign: Frame Traseiro do Celular com CTA de Upload

## O que muda

### 1. Remover imagem padrao (`src/pages/Index.tsx`)
- Alterar o estado inicial de `image` de `sampleCase` para `null`
- Remover o import do `sample-case.jpg`
- O case inicia vazio, pronto para upload

### 2. Redesenhar o frame para a parte traseira (`src/components/PhonePreview.tsx`)
- Remover o notch (elemento frontal) e a barra inferior
- Adicionar modulo de cameras traseiro no canto superior esquerdo com CSS:
  - 3 lentes circulares dispostas em triangulo (estilo iPhone 15 Pro Max)
  - Flash LED pequeno
  - Moldura arredondada ao redor do modulo
- Adicionar logo Apple centralizado (texto ou icone simples)
- Manter o fundo limpo (`bg-foreground/5`) sem cor ou imagem pre-carregada

### 3. CTA de upload dentro do case
- Quando nao ha imagem, exibir botao de upload centralizado dentro da area do case
- Texto: "Toque para adicionar sua imagem"
- Icone de upload com estilo sutil
- O modulo de cameras e o logo ficam por cima (z-index superior) da imagem quando ela for adicionada

## Detalhes Tecnicos

### Modulo de Cameras (CSS puro)
```text
+---------------------------+
|  +--------+               |
|  | O  O   |               |
|  |   O  * |  <- 3 lentes  |
|  +--------+     + flash   |
|                           |
|                           |
|         [Apple logo]      |
|                           |
|   [Upload sua imagem]     |  <- CTA quando vazio
|                           |
+---------------------------+
```

- Lentes: circulos com `border`, `bg-foreground/20`, sombra interna
- Flash: circulo menor amarelado
- Moldura do modulo: `rounded-2xl`, `border`, `bg-foreground/10`

### Arquivos Modificados
1. **`src/components/PhonePreview.tsx`** - Substituir frame frontal por traseiro com cameras
2. **`src/pages/Index.tsx`** - Remover imagem padrao, iniciar com `null`

