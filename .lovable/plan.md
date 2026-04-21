

## Problema

As imagens do pedido não aparecem no `OrderDetailDialog` porque há um **mismatch entre o que está gravado no banco e o que o componente lê**.

### Diagnóstico

Os dados no `orders.customization_data` estão salvos (confirmado via query no DB) com as chaves em **snake_case**:
```json
{
  "raw_image_url": "...",
  "original_image_url": "...",
  "edited_image_url": "...",
  "preview_image_url": "..."
}
```

O `parseOrderCustomizationData` (`src/types/customization.ts`) **suporta ambos** snake_case e camelCase corretamente — devolve `rawImageUrl`, `originalImageUrl`, etc.

Mas o `OrderImagesPreviewer.tsx` (linhas 23-26) lê os campos **errados**:

```ts
const rawPath = customizationData?.rawImageUrl ?? undefined;
const optimizedPath = customizationData?.originalImageUrl ?? undefined;
const finalPath = customizationData?.editedImageUrl ?? undefined;   // ❌ pega .editedImage no parser
const previewPath = customizationData?.previewImageUrl ?? undefined;
```

Espera, deixa eu reler o parser… o parser produz `editedImageUrl` corretamente. Então o componente está lendo OK.

**O verdadeiro bug**: O bucket `customizations` é **privado**, e o componente cria signed URLs corretamente. Vou apontar a causa raiz exata abaixo via investigação adicional dos logs/network — mas o sintoma da imagem mostra que o `OrderImagesPreviewer` **nem sequer renderiza** (não há thumbnails na screenshot).

Causa provável mais forte: o early-return na linha 36 retorna `null` se todos os 4 paths estão undefined. Como o parser está OK e o DB tem os dados, suspeitamos de **falha no `createSignedUrl`** (paths inacessíveis) OU o componente está sendo passado `customizationData` corretamente, mas as 4 chamadas `createSignedUrl` retornam `error` silenciosamente, deixando `state.url = null` e o map filtra com `if (!state.url && !state.loading) return null;` → resultado: **nada renderizado, sem feedback de erro**.

## Plano de correção

### 1. `src/components/admin/OrderImagesPreviewer.tsx`
- **Logar erros** das chamadas `createSignedUrl` (atualmente engolidos silenciosamente)
- **Mostrar fallback visível** quando o path existe mas a signed URL falha (ex.: ícone de erro com tooltip do path) em vez de simplesmente sumir
- **Adicionar título "Imagens da customização"** acima dos thumbnails para o admin saber que a seção existe (mesmo se vazia, mostrar mensagem "Sem imagens disponíveis para este pedido")

### 2. Verificar permissões de Storage
- Confirmar que o usuário admin (via `user_roles` `has_role(auth.uid(), 'admin')`) tem policy de SELECT no bucket `customizations`. Hoje, signed URLs requerem que o cliente que **gera** a URL tenha permissão de leitura no path. Como os paths estão sob `{user_id}/...`, o admin provavelmente não passa pela RLS de `storage.objects`.
- **Solução**: Adicionar RLS policy em `storage.objects` para o bucket `customizations` permitindo `SELECT` quando `has_role(auth.uid(), 'admin')`.

### Arquivos
- `src/components/admin/OrderImagesPreviewer.tsx` — melhor logging + fallback visual + título da seção
- **Migração SQL**: nova policy em `storage.objects` para admins lerem o bucket `customizations`

### Validação
- Após mudanças: abrir o mesmo pedido `#be2132f5` no admin → confirmar que os 4 thumbnails (Original, Otimizada, Recorte, Imagem Posição) aparecem.

