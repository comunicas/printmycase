

## Plano: Testar e corrigir filtros IA

### Situação atual
- Existe **1 filtro** cadastrado: "3D mascot" usando `fal-ai/image-apps-v2/style-transfer`
- O erro anterior era: "Cannot access application 'fal-ai/image-apps-v2'. Authentication is required"
- A key foi atualizada pelo usuário com novos privilégios
- Não é possível testar automaticamente via ferramentas porque a edge function requer token de usuário autenticado

### Opções

#### Opção A — Testar manualmente com a nova key
Você pode testar diretamente no app:
1. Faça login no preview
2. Vá a um produto → Personalizar → Envie uma imagem
3. Aba "Filtros IA" → Clique em "3D mascot"
4. Se funcionar, a nova key está correta

#### Opção B — Trocar para modelo público (mais seguro)
Atualizar o `model_url` do filtro para `fal-ai/image-editing/style-transfer`, que é público e funciona com qualquer key. Alterações necessárias:

| Alteração | Detalhe |
|-----------|---------|
| Banco de dados | `UPDATE ai_filters SET model_url = 'fal-ai/image-editing/style-transfer' WHERE id = 'e35f1d51-...'` |
| `apply-ai-filter/index.ts` | Atualizar detecção `isStyleTransfer` para reconhecer o novo path |
| `AiFiltersManager.tsx` | Atualizar `MODEL_OPTIONS` com o modelo público |

### Recomendação
Se você tem certeza que a nova key tem acesso ao `image-apps-v2`, teste manualmente (Opção A). Se quiser garantia sem risco, vamos com a Opção B (modelo público).

