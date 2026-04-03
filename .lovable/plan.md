

## Corrigir Imagens Quebradas nas Gerações de Usuários

### Problema
As imagens em `user_ai_generations.image_url` armazenam **URLs assinadas com expiração de 1 hora** (`createSignedUrl(storagePath, 3600)`). Após expirar, as imagens ficam quebradas na página "Minhas Gerações", no admin, e na galeria pública.

O bucket `customizations` é **privado**, então não é possível usar URLs públicas dele diretamente.

### Solução
Copiar cada imagem gerada para o bucket **público** `product-assets` e salvar a URL pública permanente no campo `image_url`. Assim, nenhuma URL expira.

### Implementação

**1. `supabase/functions/apply-ai-filter/index.ts`**
- Após upload no bucket `customizations`, **também copiar** a imagem para `product-assets/generations/{userId}/{filename}`
- Gerar URL pública com `getPublicUrl()` (sem expiração)
- Salvar essa URL pública em `image_url` no insert de `user_ai_generations`
- Manter `storage_path` apontando para `customizations` (para o fluxo de customização que usa signed URLs)

**2. `supabase/functions/upscale-image/index.ts`**
- Mesma lógica: copiar para `product-assets/generations/` e usar URL pública no `image_url`

**3. `src/pages/MyGenerations.tsx`**
- Usar `image_url` diretamente (agora será pública e permanente)
- Adicionar fallback: se `image_url` contém `/sign/`, gerar nova signed URL via `storage_path` on-the-fly

**4. Migração de dados existentes — Edge function ou script**
- Criar lógica para migrar registros existentes: ler `storage_path` do bucket `customizations`, copiar para `product-assets/generations/`, atualizar `image_url` com URL pública

### Detalhes técnicos
```text
Fluxo atual (quebrado):
  Edge fn → upload customizations (privado) → createSignedUrl(1h) → salva em image_url → EXPIRA

Fluxo novo (permanente):
  Edge fn → upload customizations (privado)
         → copia para product-assets/generations/ (público)
         → getPublicUrl() → salva em image_url → NUNCA EXPIRA
```

### Resultado
- Todas as imagens de gerações ficam permanentemente acessíveis
- Zero impacto no fluxo de customização (continua usando signed URLs do bucket privado)
- Imagens existentes migradas para URLs públicas
- 2 edge functions editadas + 1 arquivo frontend ajustado

