# Refinar UX da aba Filtros IA

## Mudanças

### 1. Grid: 4 filtros por linha em todos os tamanhos
**Arquivo:** `src/components/customize/AiFiltersList.tsx` (linhas 174 e 187)

Trocar `grid-cols-3 sm:grid-cols-4` por `grid-cols-4` nos dois grids (categorias e "Outros"). Isso garante 4 colunas mesmo em mobile estreito (≥360px), aumentando densidade e reduzindo scroll. Tile fica menor (~78px em 360px de largura), mas continua confortável para tap (>44px) graças ao gap reduzido.

Pequeno ajuste: reduzir `gap-1.5` → `gap-1` para compensar e manter respiração visual. Texto do nome fica `text-[10px]` (já é).

### 2. Copy contextual no diálogo de confirmação
**Arquivo:** `src/components/customize/FilterConfirmDialog.tsx`

Adicionar um mapa de descrições curtas por nome de filtro (resumo simples e direto do que será aplicado), exibido logo abaixo do nome do filtro. Mapa hardcoded por nome (case-insensitive), com fallback genérico.

Copies (com base nos 8 filtros ativos no banco):
- **3D mascot** → "Transforma sua foto em um mascote 3D animado, estilo Pixar."
- **Pixel Art** → "Converte a imagem em arte de pixels coloridos, estilo retrô 8-bit."
- **Foto Realista** → "Refina a foto para um visual realista, com mais nitidez e textura natural."
- **Desenho** → "Reimagina sua foto como um desenho a lápis em preto e branco."
- **Street Toy** → "Recria as pessoas como bonecos colecionáveis em estilo street/urbano."
- **Character Pop** → "Estiliza como personagem de animação pop, com cores vibrantes."
- **Posicionar** → "Reposiciona o conteúdo da imagem para enquadrar melhor na capinha."
- **+Qualidade** → "Aumenta a resolução e nitidez da imagem usando IA (upscale)."
- **Fallback** → "Aplica o estilo selecionado à sua imagem usando IA."

Layout do diálogo:
- **Imagem do estilo:** ampliar de `w-14 h-14 rounded-full` para `w-24 h-24 rounded-2xl` (de 56px para 96px, formato quadrado com cantos arredondados — mais fiel ao estilo grid e à prévia real).
- **Descrição contextual:** novo parágrafo `text-sm text-muted-foreground` centralizado, abaixo do nome.
- **Disclaimer "Imagens por IA podem variar...":** mover para o **rodapé fixo** do `DialogContent`, com aparência discreta (`text-[10px] text-muted-foreground/60 text-center`), sem destaque, como nota legal.

### 3. Estrutura final do diálogo (vertical)
```
[ X close ]
[ imagem 96x96 quadrada ]
Aplicar filtro
Pixel Art
[ descrição contextual em cinza ]
🪙 13 moedas
[ Cancelar ] [ Aplicar filtro ]
─────────────────────────────
Imagens por IA podem variar. Revise antes de finalizar.
```

## Arquivos afetados
- `src/components/customize/AiFiltersList.tsx` — grid de 4 colunas + gap.
- `src/components/customize/FilterConfirmDialog.tsx` — imagem maior, descrição contextual, disclaimer no rodapé.

## Fora do escopo
- Não altera schema do banco (descrições ficam no client por simplicidade — fácil de evoluir depois adicionando coluna `description` em `ai_filters`).
- Não altera lógica de aplicação, custo ou histórico de filtros.
- Não mexe em desktop sidebar nem em outros diálogos.
