

# Aplicar logo ArtisCase na plataforma

## Analise das cores do logo
O logo "ArtisCase" possui um gradiente que vai de azul (#4F6BF6) passando por roxo/violeta (#7C3AED) ate magenta/pink (#D946EF). O icone do celular com pincel usa o mesmo gradiente azul-para-roxo.

## O que sera feito

### 1. Copiar o logo para o projeto
- Copiar `logo-artiscase.png` para `src/assets/logo-artiscase.png`
- Importar como modulo ES6 nos componentes que precisam

### 2. Renomear marca de "Case Studio" para "ArtisCase"
Atualizar em todos os locais:
- `src/components/AppHeader.tsx` - substituir texto "Case Studio" pela imagem do logo
- `src/pages/Landing.tsx` - footer e secao "Por que escolher a ArtisCase?"
- `src/components/SeoHead.tsx` - constantes SITE_NAME e TITLE
- `index.html` - title, meta tags, og:title, twitter:title

### 3. Atualizar tema de cores para combinar com o logo
Ajustar as CSS variables em `src/index.css` para refletir o gradiente azul-roxo-magenta:
- **Primary**: Mudar de rosa/pink (333 71% 50%) para um violeta/roxo (265 83% 57%) que e o tom central do gradiente do logo
- **Ring**: Acompanhar a primary
- **Accent**: Ajustar para tons complementares do gradiente

### 4. Usar logo no header
- Substituir o texto "Case Studio" no `AppHeader.tsx` por uma tag `<img>` com o logo
- Dimensionar para ~32px de altura, mantendo proporcao

## Arquivos afetados
- **Copiar**: `user-uploads://logo-artiscase.png` -> `src/assets/logo-artiscase.png`
- **Editar**: `src/components/AppHeader.tsx` (logo image)
- **Editar**: `src/pages/Landing.tsx` (renomear marca no footer)
- **Editar**: `src/components/SeoHead.tsx` (renomear constantes)
- **Editar**: `index.html` (meta tags)
- **Editar**: `src/index.css` (cores do tema)

