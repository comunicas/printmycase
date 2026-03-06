

## Plano: Transição suave entre filtros + thumbnails de estilo nos botões

### Alterações

#### 1. PhonePreview — crossfade na troca de imagem
- Adicionar CSS `transition: opacity 0.4s ease` na camada de imagem
- Usar estado `imageTransitioning` para fazer crossfade: manter a imagem anterior com opacity 1, nova imagem entra com opacity 0→1 por cima
- Alternativamente, mais simples: adicionar `transition: opacity 0.3s ease` diretamente no div da imagem e usar um key para forçar re-render com animação

**Abordagem escolhida**: Usar duas camadas sobrepostas — a imagem anterior (fade out) e a nova (fade in) — controladas por estado no PhonePreview. Quando `image` prop muda, a camada antiga faz fade out enquanto a nova faz fade in (300ms).

#### 2. Customize — buscar `style_image_url` dos filtros e mostrar thumbnails
- Expandir a query de `ai_filters` para incluir `style_image_url`
- Expandir interface `AiFilter` com `style_image_url: string | null`
- Transformar os botões de filtro em chips com thumbnail circular à esquerda do nome
- Quando `style_image_url` existe: mostrar imagem 20×20px arredondada antes do nome
- Layout: scroll horizontal com `overflow-x-auto` e `flex-nowrap` para melhor aproveitamento em mobile

#### 3. Layout dos filtros
- Trocar `flex-wrap` por scroll horizontal (`overflow-x-auto flex-nowrap scrollbar-hide`)
- Cada chip: thumbnail circular (se disponível) + nome do filtro
- Estilo ativo: borda/fundo primary, demais outline

### Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `src/components/PhonePreview.tsx` | Crossfade entre imagens com duas camadas |
| `src/pages/Customize.tsx` | Query com `style_image_url`, thumbnails nos botões, scroll horizontal |
| `src/index.css` | Classe utilitária `scrollbar-hide` (se não existir) |

