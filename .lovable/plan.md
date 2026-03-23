

## Otimizar fluxo IA: URLs em vez de base64

### Ideia
Excelente sugestão. Hoje o fluxo é:
1. Usuário faz upload → data URL (base64) no browser
2. `compressForAI` reduz tamanho → ainda base64
3. Base64 enviada no body do edge function (~2-5MB de JSON)
4. Edge function repassa base64 para fal.ai
5. fal.ai processa e retorna URL temporária
6. Frontend converte URL → data URL de novo

**Problemas**: payload enorme no request (timeout do edge function), lentidão no upload, base64 é ~33% maior que binário.

### Novo fluxo proposto

```text
ANTES:  Browser --[base64 3MB]--> Edge Function --[base64 3MB]--> fal.ai
DEPOIS: Browser --[upload 1MB]--> Storage --> URL --> Edge Function --[URL 100 bytes]--> fal.ai
```

1. **Upload para Storage**: Após comprimir, o frontend faz upload do blob para `customizations/{userId}/ai_source_{ts}.jpg` (bucket privado)
2. **Gera URL pública temporária**: `createSignedUrl` com 5 min de validade
3. **Envia apenas a URL** para o edge function (payload minúsculo)
4. **Edge function repassa URL** para fal.ai (fal.ai aceita URLs normalmente)
5. **Resultado do fal.ai**: retorna URL → edge function retorna essa URL
6. **Frontend usa URL direto** (ou converte para data URL apenas se necessário)

Para filtros subsequentes, o resultado anterior já está no storage — basta gerar nova signed URL.

### Alterações

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | `src/hooks/useCustomize.tsx` — `handleFilterConfirm` | Em vez de `compressForAI` + enviar base64, fazer: compress → upload blob para storage → `createSignedUrl` → enviar `{ imageUrl, filterId }` |
| 2 | `src/hooks/useCustomize.tsx` — `handleUpscaleConfirm` | Mesmo approach: upload → signed URL → enviar `{ imageUrl }` |
| 3 | `supabase/functions/apply-ai-filter/index.ts` | Aceitar `imageUrl` (URL) além de `imageBase64`. Quando recebe URL, usar direto no payload do fal.ai. Manter compatibilidade com `imageBase64` por segurança |
| 4 | `supabase/functions/upscale-image/index.ts` | Mesma mudança: aceitar `imageUrl` como alternativa |
| 5 | `src/hooks/useCustomize.tsx` — estado | Adicionar `sourceStoragePath` para rastrear o path no storage e reutilizar entre filtros |
| 6 | `src/lib/image-utils.ts` | Adicionar helper `uploadForAI(dataUrl, userId): Promise<{ path, signedUrl }>` que comprime, faz upload e retorna signed URL |

### Lógica de reutilização

- **Primeiro filtro**: upload imagem original → storage → signed URL → fal.ai
- **Segundo filtro**: reusar o path original (gerar nova signed URL se expirou) → fal.ai
- **Upscale**: mesma lógica — upload → URL → fal.ai
- **Resultado**: fal.ai retorna URL temporária → frontend usa direto (sem converter para data URL)

### RLS para o bucket `customizations`

O bucket já é privado. Verificar que a policy permite upload pelo próprio usuário no prefixo `{userId}/`.

### Benefícios
- Payload do edge function cai de ~3MB para ~200 bytes
- Elimina timeout por payload grande
- fal.ai baixa a imagem direto do storage (rede rápida)
- Reutilização natural entre filtros consecutivos

