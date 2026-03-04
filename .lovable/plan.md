
# Plano de Refatoração V1

## ✅ Fase 1: Correção de Bugs Críticos — CONCLUÍDA
- Fix `delete-account` (jsr: import + getUser)
- Fix URL `/pedidos` → `/orders` no email
- Fix mini preview no checkout (editedImage)
- Fix mensagens de frete na landing

## ✅ Fase 2: Eliminação de Legados e Consolidação — CONCLUÍDA
- Criado `src/lib/types.ts` (Product, ProductColor, ProductSpec, formatPrice)
- Criado `src/lib/constants.ts` (statusLabels, statusColors)
- Criado `src/components/ui/loading-spinner.tsx` (fullPage + inline)
- Deletado `src/data/products.ts`
- Unificado `DbProduct` → `Product` em Admin + 3 componentes admin
- Atualizado imports em 15+ arquivos
- Otimizado `resolveProductInfo` com query `.or()` única

## 🔲 Fase 3: Melhorias de Arquitetura
- AuthContext (React Context para evitar múltiplas chamadas getSession)
- Lazy loading de rotas (React.lazy + Suspense)
- Otimizar SeoHead (receber produtos como prop)

## 🔲 Fase 4: Atualização de Documentação
- Reescrever ARCHITECTURE.md completo

## 🔲 Fase 5: Polimento para V1
- SEO: remover hardcoded "iPhone", SearchAction sem busca
- Error boundaries globais
- Acessibilidade (labels, aria-labels)
- Testes unitários (masks, shipping, formatPrice)
