

## Revisão: Upload otimizado + Loading melhorado

### Problema atual
Os logs mostram **"Memory limit exceeded"** na edge function — as imagens são enviadas como base64 no body do request, estourando a memória.

### Solução

**1. Frontend (`AiImageGenerator.tsx`)**
- Comprimir imagens com `compressForAI` antes do envio
- Fazer upload das imagens de referência para `product-assets/temp-refs/` no storage, obtendo URLs públicas
- Enviar apenas as URLs públicas (não base64) para a edge function
- Progress em 4 etapas: "Comprimindo imagens..." → "Enviando referências..." → "Gerando com IA..." → "Salvando resultado..."
- Adicionar barra de progresso visual com animação pulsante e ícone de etapa

**2. Edge Function (`generate-gallery-image/index.ts`)**
- Recebe URLs públicas em vez de base64 (elimina o problema de memória)
- Sem mudança na lógica de envio para fal.ai (já envia todos os params corretamente)
- Limpar imagens temporárias de `temp-refs/` após geração

### Arquivos

| Arquivo | Alteração |
|---|---|
| `src/components/admin/AiImageGenerator.tsx` | Comprimir + upload para storage, progress em etapas visuais |
| `supabase/functions/generate-gallery-image/index.ts` | Cleanup de temp refs após uso |

