

## Converter device images PNG → WebP no Storage

### Contexto
- 63 produtos com `device_image` em PNG (~500KB cada = ~31MB total)
- 6 já em JPG
- As imagens são 900x900 mas exibidas em 242x242 na home e ~160x160 em outros pontos
- As URLs estão salvas diretamente na coluna `device_image` da tabela `products`

### Abordagem
Criar uma edge function `convert-device-images` que:

1. Busca todos os produtos com `device_image` terminando em `.png`
2. Para cada imagem:
   - Faz download da PNG do Storage
   - Converte para WebP (qualidade 80, resize para 512x512 — suficiente para 2x do maior display)
   - Faz upload do arquivo `device.webp` na mesma pasta do produto no bucket `product-assets`
   - Atualiza a coluna `device_image` no banco com a nova URL `.webp`
3. Usa a lib `sharp` via Deno-compatible approach — na verdade, como estamos em Deno (edge functions), usaremos canvas/ImageMagick não disponível. **Alternativa**: usar a API de transformação de imagens do Supabase Storage (`/render/image`) para servir em WebP sem converter os arquivos originais.

### Solução mais simples: Supabase Image Transformation
O Supabase Storage suporta transformação de imagens on-the-fly via URL params. Em vez de converter e re-upload, basta alterar como as imagens são renderizadas no frontend:

```
{url}?width=512&quality=80&format=webp
```

**Alterações no código:**

**1. Utilitário `src/lib/image-utils.ts`**
- Adicionar função `optimizeStorageUrl(url, width)` que detecta URLs do Supabase Storage e appenda `?width={w}&format=origin` (preserva formato original para evitar problemas de compatibilidade, ou usa resize apenas)

**Problema**: Image Transformation é um recurso pago do Supabase e pode não estar disponível no projeto Cloud.

### Solução definitiva: Script de conversão via edge function

**1. Nova edge function `supabase/functions/convert-device-images/index.ts`**
- Endpoint admin-only (verifica role)
- Lista produtos com device_image `.png`
- Para cada um: baixa a imagem, usa canvas API (OffscreenCanvas no Deno) ou envia para um serviço externo de conversão
- **Problema**: Deno no edge functions não tem `sharp` nem `OffscreenCanvas` nativamente

### Solução prática: Script Python via lov-exec

**1. Script Python que:**
- Conecta ao banco via `psql` env vars
- Baixa cada PNG do Storage via URL pública
- Converte para WebP com Pillow (resize 512x512, quality 80)
- Re-upload via Supabase Storage REST API (usando service role key)
- Atualiza `device_image` no banco

**2. Resultado esperado:**
- ~63 PNGs convertidos de ~500KB → ~30KB WebP cada
- Economia total: ~29MB no storage, ~1.8MB por pageview na home

### Alterações

| Passo | Ação |
|-------|------|
| 1 | Script Python: download PNGs, convert WebP (Pillow), upload, update DB |
| 2 | Nenhuma alteração de código frontend necessária (URLs mudam no banco) |

