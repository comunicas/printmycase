

## Plano: Revisão e Refatoração da implementação + Documentação

### Problemas identificados

1. **Prop `modelName` não utilizada** — passada ao `PhonePreview` mas nunca consumida (removida da destructuring na linha 19)
2. **Toast de resolução duplicado** — `Customize.tsx` linhas 175-179: ambos os blocos `if` e `else if` mostram a mesma mensagem; o primeiro deveria ter mensagem mais urgente
3. **`(supabase as any)` em todos os acessos a `ai_filters`** — types.ts é auto-gerado e não inclui a tabela; não pode ser editado, mas os casts são inevitáveis. Nenhuma ação necessária.
4. **ARCHITECTURE.md desatualizado** — falta documentar: tabela `ai_filters`, `model_requests`, bucket `product-assets`, edge function `apply-ai-filter`, e a feature de filtros IA com crossfade

### Alterações

#### 1. `src/components/PhonePreview.tsx`
- Remover `modelName` da interface e destructuring (prop não utilizada)

#### 2. `src/pages/Customize.tsx`
- Remover prop `modelName` da chamada ao `PhonePreview`
- Diferenciar mensagens de toast de resolução:
  - `< 400×800`: "Resolução muito baixa" (mais urgente)
  - `< 800×1600`: "Resolução baixa" (aviso suave)

#### 3. `ARCHITECTURE.md`
- Adicionar tabela `ai_filters` e `model_requests` à seção de Modelo de Dados
- Adicionar bucket `product-assets` à tabela de Storage
- Adicionar edge function `apply-ai-filter` à tabela de Edge Functions
- Adicionar seção "Filtros IA" descrevendo a feature (crossfade, thumbnails, toggle, Fal.ai)
- Atualizar estrutura de pastas com `AiFiltersManager`, `ModelRequestsManager`

### Arquivos alterados

| Arquivo | Mudança |
|---------|---------|
| `src/components/PhonePreview.tsx` | Remover prop `modelName` não utilizada |
| `src/pages/Customize.tsx` | Remover `modelName`, diferenciar toasts de resolução |
| `ARCHITECTURE.md` | Documentar ai_filters, model_requests, product-assets, apply-ai-filter, feature de filtros IA |

