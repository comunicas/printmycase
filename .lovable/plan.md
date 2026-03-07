

## Plano: Badge de Pedidos Pendentes + Limpeza Automática de Rascunhos

### 1. Badge no UserMenu

Adicionar um hook `usePendingCount` que faz uma query leve (`select count`) na tabela `pending_checkouts` para o usuário logado. No `UserMenu.tsx`:

- Importar o hook e obter a contagem
- Exibir um badge (bolinha vermelha com número) sobre o avatar do usuário e ao lado do item "Meus Pedidos" no dropdown
- Badge só aparece quando count > 0
- Posição: absoluta sobre o botão trigger (canto superior direito do avatar)

**Novo hook** `src/hooks/usePendingCount.ts`:
```typescript
// SELECT count(*) from pending_checkouts where user_id = auth.uid()
// Retorna { count: number, loading: boolean }
```

**UserMenu.tsx changes**:
- Wrapper `relative` no trigger button
- Badge `absolute -top-1 -right-1` com count
- Badge ao lado de "Meus Pedidos" no dropdown

### 2. Scheduled Function para Limpeza (30 dias)

**Nova Edge Function** `supabase/functions/cleanup-pending-checkouts/index.ts`:
- Usa `supabaseAdmin` (service role) para deletar registros com `updated_at < now() - interval '30 days'`
- Também remove os arquivos do bucket `customizations` associados (original_image_path e edited_image_path)
- `verify_jwt = false` no config.toml

**Cron job** via `pg_cron` + `pg_net`:
- Schedule diário (`0 3 * * *` — 3h da manhã)
- Chama a edge function via `net.http_post`

### Arquivos alterados/criados

| Arquivo | Ação |
|---|---|
| `src/hooks/usePendingCount.ts` | Criar — hook de contagem |
| `src/components/UserMenu.tsx` | Editar — adicionar badge |
| `supabase/functions/cleanup-pending-checkouts/index.ts` | Criar — edge function de limpeza |
| `supabase/config.toml` | Editar — adicionar entry da nova function |
| SQL (insert tool) | Criar cron job via pg_cron |

