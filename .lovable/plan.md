

## Avaliação Honesta e Plano Revisado

### Riscos do plano anterior

1. **Escopo excessivo**: Aplicar `AdminSection` em 6+ managers (Products, Orders, AiFilters, Collections, ModelRequests, CollectionDesigns) é alto risco. Cada um tem estrutura interna diferente — Products tem bulk selection bar, Orders tem paginação, AiFilters tem dialogs complexos. Forçar um wrapper genérico pode quebrar layouts específicos ou exigir muitas props opcionais, tornando o componente confuso.

2. **AdminFilterChips**: Só dois componentes usam filter chips (CoinsManager e OrdersManager), e os chips do OrdersManager usam `statusLabels` importado de constants. Criar um componente genérico para apenas 2 usos é over-engineering.

3. **Hook `useCoinSettings`**: O hook usa `(supabase as any)` — um cast forçado que indica que a tabela `coin_settings` pode não estar no tipo gerado. O CoinsManager atual faz o fetch direto sem esse cast. Migrar para o hook pode introduzir problemas de tipagem ou, pior, o hook pode não estar retornando dados corretamente.

### Abordagem mais segura e pragmática

Focar apenas nos **2 problemas reais** que o usuário reportou, sem refatorações arriscadas:

#### 1. Corrigir TabsList quebrando (`src/pages/Admin.tsx`)
- Linha 27: trocar `overflow-x-auto` por `flex-wrap h-auto gap-1`
- Impacto: mínimo, só CSS

#### 2. Melhorar layout de Configurações de Moedas (`src/components/admin/CoinsManager.tsx`)
- Adicionar `ai_upscale_cost: "Custo upscale IA (moedas)"` ao `settingLabels`
- Reorganizar os campos em 2 grupos visuais (Bônus e Custos IA) com subtítulos
- Melhorar o visual dos inputs com labels maiores e espaçamento
- **Manter** a lógica de fetch e state atual (funciona, está testada)
- **Não** migrar para o hook `useCoinSettings` (evita risco de regressão com o cast `as any`)

#### Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/Admin.tsx` | `flex-wrap h-auto gap-1` na TabsList (1 linha) |
| `src/components/admin/CoinsManager.tsx` | Adicionar label + redesenhar seção settings com grupos |

#### O que NÃO fazer agora
- Criar `AdminSection` e `AdminFilterChips` — poucos usos, alto risco de quebra
- Refatorar outros managers — não foram reportados como problema
- Migrar para hook `useCoinSettings` — cast `as any` é red flag

**Total: 2 arquivos, mudanças cirúrgicas, zero risco de regressão.**

