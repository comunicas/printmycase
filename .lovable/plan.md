

## Paginação no Histórico + Correções

### Problemas encontrados
1. **Sem paginação** — histórico renderiza até 100 itens de uma vez
2. **Bug: `expires_at` pode ser null** — linha 197 faz `new Date(tx.expires_at)` sem verificar null, causando data inválida e comportamento incorreto no badge "Expirado"

### Alterações — `src/pages/Coins.tsx`

1. **Paginação client-side no histórico** — constante `HISTORY_PAGE_SIZE = 10`, estado `historyPage` que reseta ao trocar de tab, controles de navegação (setas + "1 / N") abaixo da lista
2. **Fix null check em `expires_at`** — só marcar como expirado se `tx.expires_at` existir e for anterior a `now()`
3. **Importar `ChevronLeft`, `ChevronRight`** do lucide

Nenhuma mudança de backend.

