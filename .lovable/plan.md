

## Otimização de Thumbnails — Plano Completo

### Diagnóstico

Analisei todas as imagens renderizadas como thumbnails na aplicação. Problemas encontrados:

| Problema | Impacto | Arquivos |
|----------|---------|----------|
| **Thumbs sem `width`/`height` explícitos** | CLS — browser não reserva espaço antes do download | `CollectionPage.tsx`, `SelectModel.tsx`, `MyGenerations.tsx`, `DesignPage.tsx`, `ModelSelector.tsx`, `PendingCheckoutCards.tsx`, `ProductsTable.tsx` |
| **Thumbs sem `loading="lazy"`** | Downloads desnecessários — imagens fora do viewport carregam junto | `DesignPage.tsx` (thumb do design e device), `CollectionDesignsManager.tsx`, `ImageGalleriesManager.tsx` |
| **Sem fallback `onError`** | Imagem quebrada visível se URL expirar ou falhar | `CollectionPage.tsx`, `SelectModel.tsx`, `MyGenerations.tsx`, `DesignPage.tsx`, `PendingCheckoutCards.tsx`, `ModelSelector.tsx` |
| **Imagem principal do design sem `width`/`height`** | CLS na página do design (LCP element) | `DesignPage.tsx` |

### Plano de Correções

| # | Arquivo | O que |
|---|---------|-------|
| 1 | `CollectionPage.tsx` | Adicionar `width={300} height={300}` e `onError` handler nas imagens dos designs |
| 2 | `SelectModel.tsx` | Adicionar `width={300} height={300}` e `onError` handler nas thumbs dos modelos |
| 3 | `MyGenerations.tsx` | Adicionar `width={180} height={320}` (aspect 9/16) e `onError` handler |
| 4 | `DesignPage.tsx` | Adicionar `width={600} height={600}` na imagem principal, `width={64} height={64}` na thumb, `width={120} height={120}` na device image. Adicionar `onError` em todas |
| 5 | `ModelSelector.tsx` | Adicionar `width={32} height={32}` e `onError` handler nas mini thumbs (w-8 h-8) |
| 6 | `PendingCheckoutCards.tsx` | Adicionar `width={56} height={56}` e `onError` handler |
| 7 | `ProductGallery.tsx` | Adicionar `width={600} height={600}` na imagem principal, `width={64} height={64}` nas thumbnails |
| 8 | `ProductsTable.tsx` (admin) | Adicionar `width={40} height={40}` |
| 9 | `OrderImagesPreviewer.tsx` (admin) | Adicionar `width={56} height={80}` nas thumbs |
| 10 | `CollectionDesignsManager.tsx` (admin) | Adicionar `loading="lazy"` e dimensões nas imagens dos designs |

### Detalhes

- **`onError` padrão**: `onError={(e) => { e.currentTarget.style.display = 'none'; }}` — esconde imagem quebrada sem quebrar layout
- **Dimensões**: valores escolhidos para corresponder ao tamanho CSS renderizado, evitando CLS sem forçar reflow
- **Prioridade**: páginas públicas (1-6) primeiro, admin (7-10) depois — impacto no SEO é apenas nas públicas

