
## Plano: Corrigir vulnerabilidade de segurança no edge function cleanup-pending-checkouts

### Contexto
O scan de segurança detectou que o edge function `cleanup-pending-checkouts` é **publicamente acessível** sem autenticação. Atualmente, dois cron jobs (`cleanup-pending-checkouts-daily` e `cleanup-pending-checkouts-hourly`) chamam este endpoint usando o anon key, o que permite que qualquer pessoa invoque a função via HTTP.

### Vulnerabilidade
- **Edge function**: `supabase/functions/cleanup-pending-checkouts/index.ts`
- **Problema**: Nenhuma validação de autenticação ou autorização
- **Risco**: Qualquer um pode deletar dados de `pending_checkouts` e arquivos do storage

### Solução
Implementar validação de um secret compartilhado entre os cron jobs e a função.

**Passos:**

1. **Criar novo secret `CRON_SECRET`** (solicitado ao usuário)
   - Este será um token único para autenticar chamadas do cron job

2. **Atualizar edge function** (`cleanup-pending-checkouts/index.ts`)
   - Validar header `X-Cron-Secret` contra `Deno.env.get("CRON_SECRET")`
   - Retornar 401 se secret inválido ou ausente

3. **Atualizar cron jobs** (via SQL)
   - Modificar ambos (`cleanup-pending-checkouts-daily` e `cleanup-pending-checkouts-hourly`)
   - Adicionar header `X-Cron-Secret` com o valor do secret

4. **Remover cron job duplicado** (bonus)
   - Manter apenas o job `cleanup-pending-checkouts-hourly`
   - Deletar `cleanup-pending-checkouts-daily` (redundante)

### Arquivos a modificar
| Arquivo | Ação |
|---------|------|
| `supabase/functions/cleanup-pending-checkouts/index.ts` | Adicionar validação de secret |
| SQL para cron jobs | Atualizar headers de chamada e deletar job diário |

### O que o usuário fornecerá
**Um valor único para `CRON_SECRET`** — pode ser uma string aleatória forte (ex: `sup_cron_abc123xyz789...`) que será gerado automaticamente pelo sistema Lovable.

