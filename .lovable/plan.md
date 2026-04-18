
## Por que a produção mostra o fallback (carrossel marquee) em vez das gerações dos usuários

### Diagnóstico

O componente `AiCoinsSection` consulta `public_ai_generations` no Supabase e:
- **Se houver dados** → mostra o grid mosaico com gerações reais dos usuários (correto)
- **Se vazio/erro** → mostra o carrossel marquee com `ai-showcase-[1-5]-sm.webp` (fallback — o que você vê na imagem)

```tsx
const hasPublicImages = images.length > 0;
{hasPublicImages ? <Grid mosaico /> : <Carrossel fallback />}
```

### Causa provável

Vou verificar as 3 hipóteses possíveis:
1. **A view `public_ai_generations` está vazia em produção** (nenhuma geração foi marcada como pública/aprovada)
2. **RLS bloqueando leitura anônima** da view em produção
3. **Erro silencioso na query** (sem `.then` capturando erro)

### Investigação a fazer (read-only)

1. Consultar `public_ai_generations` via `supabase--read_query` para ver quantos registros existem
2. Verificar RLS policies da view/tabela base
3. Buscar o critério de "público" (provavelmente `is_public=true` na tabela `ai_generations` + migração para bucket `product-assets` conforme memória `public-gallery-permanent-storage`)
4. Verificar se há gerações aprovadas mas não migradas (campo `public_image_url` nulo)

### Possíveis correções (a confirmar após diagnóstico)

- **Se a view está vazia**: ensinar admin a aprovar gerações via painel (`GalleryImagesManager` ou similar) — não é bug de código
- **Se RLS bloqueia anônimo**: ajustar policy para `SELECT` público
- **Se há gerações marcadas mas sem `public_image_url`**: rodar `migrate-generation-urls` edge function para mover ao bucket público

### Próximo passo

Investigar via SQL e leitura de código (admin de galeria + edge function de migração) e voltar com o diagnóstico exato + correção recomendada antes de qualquer mudança.
