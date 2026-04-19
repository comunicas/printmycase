
## Revisão e expansão de Designs de Coleção

### Problemas detectados

1. **Legado nunca usado**: `collection_designs.stripe_price_id` e `stripe_product_id` estão NULL em 100% dos 12 designs. Edge function `create-checkout` já cai em fallback `price_data` inline, então remover é seguro.
2. **Falta de campos**: schema atual não tem `description` nem suporte a múltiplas imagens (só `image_url` única).
3. **Slugs inválidos**: 5 designs com letras maiúsculas (`Omg`, `Bla`, `Nao-fala-nada`, `Um-dia-de-cada-vez`, `Vida-que-segue`) e 2 coleções (`Creative`, `Design`). URLs case-sensitive quebram navegação e SEO.
4. **`sort_order` duplicado**: coleção Brasil tem 4 designs com `sort_order=0`.
5. **Admin limitado**: form atual aceita apenas 1 imagem e não tem textarea de descrição.
6. **DesignPage**: mostra só uma imagem, sem galeria nem texto descritivo do produto.

### Plano de execução

**Fase 1 — Migração de schema** (`collection_designs`)
- Adicionar coluna `description text NULL`
- Adicionar coluna `images text[] NOT NULL DEFAULT '{}'` (galeria de imagens adicionais; `image_url` permanece como capa principal)
- Remover colunas legado: `stripe_price_id`, `stripe_product_id`

**Fase 2 — Limpeza de dados** (via insert tool)
- Normalizar slugs para lowercase + sanitização: `Omg`→`omg`, `Bla`→`bla`, `Nao-fala-nada`→`nao-fala-nada`, `Um-dia-de-cada-vez`→`um-dia-de-cada-vez`, `Vida-que-segue`→`vida-que-segue`
- Normalizar slugs de coleções: `Creative`→`creative`, `Design`→`design`
- Reordenar `sort_order` por coleção (0,1,2,3...) eliminando duplicatas

**Fase 3 — Admin: `CollectionDesignsManager`**
- Adicionar `<textarea>` de descrição no dialog
- Adicionar uploader de **múltiplas imagens adicionais** (reutilizar padrão de `ProductImagesUpload`): preview em grid, remover individual, reordenar
- Manter `image_url` como "capa" obrigatória (primeira imagem destacada)
- Auto-slug já força lowercase (verificar/garantir)

**Fase 4 — Frontend: `DesignPage`**
- Adicionar galeria estilo `ProductGallery` (capa + thumbs das `images` adicionais) com zoom click
- Adicionar bloco "Descrição" abaixo do título quando `description` existir
- Atualizar JSON-LD do produto para incluir `description` real e array `image`

**Fase 5 — Cleanup de código**
- Remover referências a `stripe_price_id`/`stripe_product_id` em:
  - `src/hooks/useCollections.ts` (tipo deriva de `Tables` — auto-atualiza)
  - `supabase/functions/create-checkout/index.ts` (linha 230: simplificar para sempre usar `price_data` inline em compras de design)
  - Tipos auto-gerados se atualizam sozinhos via migração

### Arquivos modificados

- **Migração SQL** (nova): adicionar `description` + `images[]`, remover stripe_*
- **Insert SQL** (data): normalizar slugs e sort_order
- `src/components/admin/CollectionDesignsManager.tsx` — novos campos
- `src/pages/DesignPage.tsx` — galeria + descrição
- `supabase/functions/create-checkout/index.ts` — simplificar branch de design

### Riscos

- **Slugs mudam**: URLs antigas quebram. Mitigação: poucos designs (12), tráfego ainda baixo, sem links externos conhecidos para os 5 slugs ruins. Aceitável.
- **Remover colunas Stripe**: zero impacto em runtime (sempre foram NULL e função usa fallback).
