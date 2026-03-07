

## Code Review e Plano de Lançamento V1

Fiz uma análise completa do código, banco de dados, RLS, secrets e edge functions. Aqui está o diagnóstico e o plano de ação organizado por prioridade.

---

### Estado Atual

- **73 produtos** cadastrados com `stripe_price_id` e `stripe_product_id` sincronizados
- **12 tabelas** com RLS habilitado e 34 policies
- **9 edge functions** deployadas
- **4 secrets** configurados: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `FAL_API_KEY`, `LOVABLE_API_KEY`
- **0 pedidos** no banco (ambiente de teste limpo)

---

### Problemas Encontrados

#### Segurança (Prioridade Alta)

| # | Issue | Severidade | Solução |
|---|-------|-----------|---------|
| 1 | `model_requests` INSERT com `WITH CHECK (true)` — qualquer pessoa pode inserir sem autenticação, abrindo para spam | Error | Adicionar rate limiting ou exigir autenticação |
| 2 | `coin_transactions` e `referrals` policies aplicam-se a `{public}` em vez de `{authenticated}` | Warn | Alterar para `TO authenticated` |
| 3 | `coin_settings` SELECT policy usa `USING (true)` — qualquer autenticado vê tudo (aceitável, mas documentar) | Info | OK — são configs públicas |

#### Stripe (Prioridade Alta — Bloqueante para Produção)

| # | Item | Status | Ação |
|---|------|--------|------|
| 4 | Chaves Stripe são de teste ou produção? | Verificar | Confirmar se `STRIPE_SECRET_KEY` já é live (`sk_live_...`) |
| 5 | `STRIPE_WEBHOOK_SECRET` precisa de novo endpoint para produção | Pendente | Criar webhook endpoint apontando para a URL publicada |
| 6 | `create-checkout` hardcodes `artiscase-v2.lovable.app` como fallback de origin | Issue | Atualizar para domínio de produção quando definido |

#### Frete e Restrições

| # | Item | Detalhe |
|---|------|---------|
| 7 | `ALLOWED_REGIONS = ["Sudeste"]` em `shipping.ts` | Apenas Sudeste aceito — confirmar se é intencional para V1 |

#### Código (Prioridade Baixa)

| # | Item | Detalhe |
|---|------|---------|
| 8 | `console.error` em Checkout e Admin | Aceitável em produção para debugging, não é leak de dados |
| 9 | `(supabase as any)` cast em Customize.tsx (linha 64) | Funcional mas sem type-safety — cosmético |

---

### Checklist de Lançamento

```text
PRÉ-LANÇAMENTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] 1. Confirmar chaves Stripe live
[ ] 2. Criar webhook endpoint Stripe para URL de produção
[ ] 3. Atualizar STRIPE_WEBHOOK_SECRET com o novo signing secret
[ ] 4. Rodar bulk-sync-stripe para registrar produtos no Stripe live
[ ] 5. Fix RLS: model_requests (rate limit ou auth)
[ ] 6. Fix RLS: coin_transactions e referrals → TO authenticated
[ ] 7. Confirmar regiões de frete (só Sudeste?)
[ ] 8. Definir domínio customizado (se aplicável)

PÓS-LANÇAMENTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[ ] 9. Testar fluxo completo: cadastro → customizar → checkout → webhook
[ ] 10. Configurar cleanup-pending-checkouts como cron job
[ ] 11. Monitorar logs das edge functions
```

---

### O que posso implementar agora

Os itens **5 e 6** (fixes de RLS) posso resolver com migrations. O item **6** do fallback de origin no `create-checkout` posso ajustar no código.

Os itens de Stripe (1-4) dependem de ações suas no painel do Stripe — posso guiar o processo passo a passo.

