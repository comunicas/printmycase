

# Code Review Completo + Plano de Refatoração para V1

## 1. Diagnóstico Geral

A plataforma ArtisCase e um e-commerce funcional para capas personalizadas com stack moderna (React 18, Tailwind, Supabase, Stripe). O fluxo principal (catálogo -> produto -> customização -> checkout -> pagamento) está implementado e funcional. Abaixo, o levantamento completo de problemas, legados e oportunidades de melhoria.

---

## 2. Problemas Identificados

### 2.1 Bugs e Erros Ativos

| # | Problema | Arquivo | Severidade |
|---|----------|---------|------------|
| 1 | `delete-account` usa `esm.sh` import (violando a convenção `jsr:` do projeto) e chama `auth.getClaims()` que pode não existir na versão do SDK | `supabase/functions/delete-account/index.ts` | **Alta** |
| 2 | Email de notificação aponta para `/pedidos` mas a rota real é `/orders` | `supabase/functions/notify-order-status/index.ts` L93 | Media |
| 3 | `Landing.tsx` anuncia "Frete Grátis" nos benefícios, mas o checkout cobra frete regional | `src/pages/Landing.tsx` L22 | Media |
| 4 | `ALLOWED_REGIONS` restringe envio ao Sudeste, mas a landing diz "todo o Brasil" | `src/lib/shipping.ts` + `Landing.tsx` | Media |
| 5 | `SeoHead` referencia `SearchAction` com `?q=` mas o catálogo não tem busca implementada | `src/components/SeoHead.tsx` L49 | Baixa |
| 6 | `Checkout.tsx` mini preview mostra a imagem original (pode ser `null` no fallback de compressão), deveria usar `editedImage` | `src/pages/Checkout.tsx` L166-169 | Media |
| 7 | `useAuth` não retrata o estado `loading` durante `refetchProfile` (UI pode piscar) | `src/hooks/useAuth.ts` | Baixa |

### 2.2 Legados e Inconsistências

| # | Item | Detalhe |
|---|------|---------|
| 1 | `ARCHITECTURE.md` desatualizado | Ainda diz "sem backend", "Case Studio" (nome antigo), lista `data/products.ts` como "17 modelos mock", não menciona auth/checkout/admin/orders/Stripe/Supabase |
| 2 | `src/data/products.ts` contém apenas tipos e `formatPrice` | O nome `data/` sugere dados mock, mas os dados reais vêm do DB. Deveria ser movido para `src/lib/` ou `src/types/` |
| 3 | Interface `Product` duplicada | Definida em `src/data/products.ts` e reimplantada como `DbProduct` em `src/pages/Admin.tsx` |
| 4 | `ALLOWED_REGIONS` hardcoded | Sem mecanismo para admin expandir regiões de entrega |
| 5 | `statusLabels` duplicado | Definido em `Admin.tsx`, `notify-order-status/index.ts`, e `Orders.tsx` (parcialmente) |
| 6 | Spinners de loading repetidos | O mesmo padrão `<div className="animate-spin..." />` é copiado em ~8 arquivos |
| 7 | `SeoHead` hardcoded para "iPhone" | Texto SEO menciona "iPhone" mas produtos agora incluem Motorola |

### 2.3 Segurança

| # | Item | Status |
|---|------|--------|
| 1 | RLS em todas as tabelas | OK |
| 2 | Admin via `user_roles` + `has_role()` SECURITY DEFINER | OK |
| 3 | Edge functions validam JWT | OK (exceto `delete-account` com import problemático) |
| 4 | `notify-order-status` valida admin server-side | OK |
| 5 | `stripe-webhook` verifica assinatura HMAC | OK |
| 6 | `customizations` bucket é privado | OK |

### 2.4 Performance

| # | Item | Detalhe |
|---|------|---------|
| 1 | `useAuth` é chamado em cada componente isoladamente | Sem React Context — múltiplas chamadas `getSession()` simultâneas |
| 2 | `resolveProductInfo` faz 2 queries (by slug + by id) | Poderia ser otimizado com uma única query `or` |
| 3 | `SeoHead` chama `useProducts(8)` novamente na landing | Já carrega produtos no componente pai |
| 4 | Sem lazy loading de rotas | Todas as páginas são importadas sincronamente no `App.tsx` |

---

## 3. Plano de Refatoração em Fases

### Fase 1: Correção de Bugs Críticos
**Estimativa: 3-4 mensagens**

1. **Fix `delete-account`**: Migrar de `esm.sh` para `jsr:`, substituir `getClaims()` por `getUser()`
2. **Fix URL do email**: Corrigir `/pedidos` para `/orders` no template de notificação
3. **Fix mini preview no checkout**: Usar `editedImage` ao invés de `image` (que pode ser null)
4. **Fix mensagens de frete na landing**: Remover "Frete Grátis" e "todo o Brasil", ou ajustar para a realidade (frete regional, apenas Sudeste)

### Fase 2: Eliminação de Legados e Consolidação
**Estimativa: 4-5 mensagens**

1. **Mover `src/data/products.ts`** para `src/lib/types.ts` (apenas tipos + formatPrice)
2. **Unificar `statusLabels`**: Criar `src/lib/constants.ts` com status labels/colors compartilhados
3. **Unificar `DbProduct` e `Product`**: Uma única interface em `src/lib/types.ts`
4. **Extrair componente `LoadingSpinner`**: Substituir os ~8 spinners duplicados
5. **Otimizar `resolveProductInfo`**: Query única com `.or()`

### Fase 3: Melhorias de Arquitetura
**Estimativa: 3-4 mensagens**

1. **AuthContext**: Criar `AuthProvider` com React Context para evitar múltiplas chamadas de `getSession()`
2. **Lazy loading de rotas**: `React.lazy()` + `Suspense` no `App.tsx` para code splitting
3. **Otimizar SeoHead**: Receber produtos como prop em vez de fazer query própria

### Fase 4: Atualização de Documentação
**Estimativa: 1-2 mensagens**

1. **Reescrever `ARCHITECTURE.md`** completamente:
   - Nome correto: ArtisCase
   - Stack completa: React + Supabase + Stripe + Lovable Cloud
   - Mapa de rotas atualizado (13 rotas, não 5)
   - Modelo de dados real (DB, não mock)
   - Fluxo de checkout e pagamento
   - Edge Functions e webhooks
   - Sistema de autenticação e RBAC
   - Estrutura de pastas atualizada
   - Convenções de código atualizadas

### Fase 5: Polimento para V1
**Estimativa: 3-4 mensagens**

1. **SEO**: Atualizar `SeoHead` para não hardcodar "iPhone", remover SearchAction sem implementação
2. **Tratamento de erros**: Adicionar error boundaries globais
3. **Acessibilidade**: Verificar labels em formulários, aria-labels em botões de ícone
4. **Testes**: Adicionar testes unitários para `masks.ts`, `shipping.ts`, `formatPrice`

---

## 4. Resumo de Prioridades

```text
Prioridade 1 (Fase 1): Bugs que afetam funcionalidade
  └── delete-account quebrado, URLs erradas, preview null

Prioridade 2 (Fase 2): Dívida técnica que dificulta manutenção
  └── Tipos duplicados, constantes espalhadas, código repetido

Prioridade 3 (Fase 3): Arquitetura para escalar
  └── AuthContext, code splitting, otimização de queries

Prioridade 4 (Fase 4-5): Documentação e polimento
  └── ARCHITECTURE.md, SEO, acessibilidade, testes
```

---

## 5. Ordem de Execução Sugerida

Recomendo aprovar este plano e executar fase por fase, começando pela **Fase 1** (bugs críticos). Cada fase pode ser implementada em mensagens separadas para manter o controle e permitir testes intermediários.

