

## Nova Seção: Tecnologia de Impressão (Dark Mode)

Inserir entre "Modelos em Destaque" e "Depoimentos" (após linha 200) uma seção dark-mode sobre a tecnologia Micro Piezo.

### Layout

- Fundo escuro (`bg-zinc-950 text-white`) quebrando o padrão claro da página
- Título "Tecnologia de Impressão" + subtítulo mencionando Micro Piezo
- Grid 2 colunas no desktop: esquerda com os 5 atributos em mini-cards, direita com thumbnail do vídeo YouTube + botão play que abre modal
- Logos Epson e PrecisionCore exibidos como badges de parceiro abaixo dos atributos
- Modal (Dialog) com iframe do YouTube embed ao clicar no vídeo

### 5 Atributos (ícones Lucide)

1. Precisão extrema — `Crosshair`
2. Cores vibrantes — `Palette`
3. Alta definição — `Eye`
4. Tecnologia profissional — `Cpu`
5. Velocidade e qualidade — `Zap`

Cada um como um item compacto: ícone + título + descrição curta, com fundo `bg-white/5` e borda `border-white/10`.

### Vídeo

- Thumbnail gerada via `https://img.youtube.com/vi/PMDJZLS7X8w/maxresdefault.jpg`
- Overlay com ícone Play centralizado
- Ao clicar abre `Dialog` com iframe `https://www.youtube.com/embed/PMDJZLS7X8w?autoplay=1`

### Logos

- Copiar as imagens Epson e PrecisionCore para `src/assets/`
- Exibir como `<img>` com `h-8 opacity-70` lado a lado, abaixo dos atributos

### Arquivos

- **`src/pages/Landing.tsx`** — adicionar seção + state para modal de vídeo + imports dos logos
- Copiar 2 logos para `src/assets/`

