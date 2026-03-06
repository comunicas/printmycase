

## Plano: Adicionar logging detalhado na edge function

### Alterações em `supabase/functions/apply-ai-filter/index.ts`

Adicionar 3 pontos de logging:

1. **Antes da chamada ao Fal.ai** (após linha 90): logar modelo, parâmetros enviados (sem a imagem base64)
```typescript
console.log("Fal.ai request:", JSON.stringify({ modelUrl, isStyleTransfer, params: { ...falBody, image_url: "[base64 omitted]" } }));
```

2. **Após resposta do Fal.ai** (após linha 110): logar estrutura da resposta e dimensões da imagem retornada
```typescript
const outputImage = falResult?.images?.[0];
console.log("Fal.ai response:", JSON.stringify({ 
  imageCount: falResult?.images?.length, 
  width: outputImage?.width, 
  height: outputImage?.height, 
  content_type: outputImage?.content_type 
}));
```

3. **Após fetch da imagem** (após linha 121 aprox): logar tamanho do buffer e content-type
```typescript
console.log("Fetched image:", JSON.stringify({ bytes: imgBuffer.byteLength, contentType }));
```

| Arquivo | Mudança |
|---------|---------|
| `supabase/functions/apply-ai-filter/index.ts` | 3 `console.log` para rastrear params, resposta e imagem final |

