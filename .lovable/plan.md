

## Plano Completo: Migração do Remix para PrintMyCase

Revisão senior do projeto completo. O plano está organizado em 5 fases sequenciais para garantir que o remix funcione perfeitamente.

---

### Achados Críticos da Revisão

| Problema | Severidade | Onde |
|----------|-----------|------|
| `STRIPE_SECRET_KEY` **não existe nos secrets** — 4 Edge Functions vão quebrar | CRÍTICA | `create-checkout`, `create-coin-checkout`, `admin-sync-stripe`, `bulk-sync-stripe` |
| Domínio `studio.artiscase.com` hardcoded em allowlists de redirect | CRÍTICA | `create-checkout`, `create-coin-checkout` |
| ID do projeto antigo `gfsbsgwxylvhnwbpcodj` em URLs de logo | ALTA | 6 email templates + `index.html` preconnect |
| Marca "ArtisCase" em ~100 referências no frontend e backend | ALTA | 19 arquivos |
| `auth-email-hook` usa envio direto (sem fila pgmq) — sem retry | MÉDIA | `auth-email-hook/index.ts` |
| Fallback `event_source_url` aponta para `artiscase-v2.lovable.app` | MÉDIA | `stripe-webhook/index.ts` |
| Logo antigo importado em 5 páginas (`logo-artiscase.png/webp`) | ALTA | Landing, Login, Signup, CheckoutSuccess, AppHeader |
| Email de contato `sac@artiscase.com` | ALTA | `Landing.tsx` footer |
| `Moedas ArtisCase` no Stripe checkout de moedas | MÉDIA | `create-coin-checkout` |
| Social images no `index.html` apontam para storage do projeto antigo | BAIXA | `index.html` og:image, twitter:image |

---

### Fase 1 — Secrets e Infraestrutura (pré-requisito)

Sem isso, nenhum checkout ou webhook funciona.

1. **Adicionar secret `STRIPE_SECRET_KEY`** — Solicitar ao usuário a chave secreta do Stripe (nova conta ou mesma)
2. **Atualizar secrets existentes** — `STRIPE_WEBHOOK_SECRET`, `FAL_API_KEY`, `CRON_SECRET`, `META_ACCESS_TOKEN` (conforme solicitado originalmente)
3. **Upload do novo logo** para o bucket `email-assets` (ex: `logo-printmycase.png`)

---

### Fase 2 — Backend: Edge Functions (10 arquivos)

Todas as Edge Functions que referenciam o domínio/marca antigos.

**`create-checkout/index.ts`**
- `ALLOWED_ORIGINS` → `["https://printmycase.com.br"]`
- `DEFAULT_ORIGIN` → `"https://printmycase.com.br"`

**`create-coin-checkout/index.ts`**
- Mesmas mudanças de origins
- `Moedas ArtisCase` → `Moedas PrintMyCase`

**`auth-email-hook/index.ts`**
- `SITE_NAME` → `"PrintMyCase"`
- `SENDER_DOMAIN`, `ROOT_DOMAIN`, `FROM_DOMAIN` → `"printmycase.com.br"`
- `SAMPLE_PROJECT_URL` → `"https://printmycase.com.br"`
- Todos os 6 `EMAIL_SUBJECTS` → trocar "ArtisCase" por "PrintMyCase"

**`notify-order-status/index.ts`**
- `SENDER_DOMAIN` → `"printmycase.com.br"`
- `FROM` → `"PrintMyCase <noreply@printmycase.com.br>"`
- HTML: `alt="ArtisCase"` → `alt="PrintMyCase"`, footer text → `"PrintMyCase — Cases personalizadas"`
- `APP_URL` fallback → `"https://printmycase.com.br"`
- Logo URL → novo logo do novo projeto

**`stripe-webhook/index.ts`**
- Fallback `event_source_url` → `"https://printmycase.com.br"`

**`meta-capi/index.ts`** — Pixel ID permanece o mesmo, sem alteração

**`admin-sync-stripe/index.ts`** e **`bulk-sync-stripe/index.ts`** — Sem referências de marca, apenas dependem de `STRIPE_SECRET_KEY` (Fase 1)

**`apply-ai-filter/index.ts`** e **`upscale-image/index.ts`** — Dependem de `FAL_API_KEY` (Fase 1), sem referências de marca

**Deploy**: Todas as Edge Functions devem ser redeployadas após as alterações.

---

### Fase 3 — Backend: Email Templates (6 arquivos)

Em `supabase/functions/_shared/email-templates/`:

Para cada um dos 6 templates (`signup.tsx`, `recovery.tsx`, `magic-link.tsx`, `invite.tsx`, `email-change.tsx`, `reauthentication.tsx`):

- `logoUrl`: trocar `gfsbsgwxylvhnwbpcodj` → `iqnqpwnbdqzvqssxcxgb` e nome do arquivo do logo
- Todas as strings "ArtisCase" → "PrintMyCase" (Preview text, alt text, body text, brand footer)

---

### Fase 4 — Frontend: Marca e Domínio (9 arquivos)

**`index.html`**
- `<title>` → "PrintMyCase: Crie sua Capinha Personalizada em Minutos"
- `og:title`, `twitter:title` → "PrintMyCase..."
- `description`, `og:description`, `twitter:description` → trocar "ArtisCase" por "PrintMyCase"
- `meta author` → "PrintMyCase" (era "Case Studio")
- Preconnect: `gfsbsgwxylvhnwbpcodj.supabase.co` → `iqnqpwnbdqzvqssxcxgb.supabase.co`
- Social images: atualizar quando disponíveis (pode ser feito depois)
- Meta Pixel e Clarity IDs: **manter os mesmos**

**`src/components/SeoHead.tsx`**
- `SITE_NAME` → `"PrintMyCase"`
- `TITLE` → `"PrintMyCase | Capas Personalizadas para Celular"`
- Fallback URL → `"https://printmycase.com.br"`

**`src/pages/Product.tsx`**
- `SITE_NAME` → `"PrintMyCase"`
- Fallback URL → `"https://printmycase.com.br"`

**`src/pages/Landing.tsx`**
- Import do logo: `logo-artiscase.webp` → novo logo
- `alt="ArtisCase"` → `alt="PrintMyCase"` (header logo + footer logo)
- `sac@artiscase.com` → `sac@printmycase.com.br`
- Steps desc: `"ArtisCoins"` → `"PrintCoins"` ou simplesmente `"moedas"`
- Import `WhyArtisCase` → considerar renomear o componente

**`src/pages/Login.tsx`**
- Import do logo: `logo-artiscase.png` → novo logo
- `alt="ArtisCase"` → `alt="PrintMyCase"`

**`src/pages/Signup.tsx`**
- Mesmas alterações de logo e alt

**`src/pages/CheckoutSuccess.tsx`**
- Mesmas alterações de logo e alt

**`src/components/AppHeader.tsx`**
- `alt="ArtisCase"` → `alt="PrintMyCase"`
- Imagem do logo no header: `/lovable-uploads/79379ce7-...` → novo logo uploadado

**`src/components/WhyArtisCase.tsx`**
- Renomear arquivo e componente para `WhyPrintMyCase.tsx` (e atualizar import em Landing.tsx)

---

### Fase 5 — Configuração de Domínio e Email

1. **Configurar domínio customizado** `printmycase.com.br` em Settings → Domains
2. **Configurar domínio de email** para envio de emails autenticados via `printmycase.com.br`
3. **Publicar** o projeto após todas as alterações

---

### Arquivos do Admin

O painel admin (`src/pages/Admin.tsx` e componentes em `src/components/admin/`) **não contém referências à marca ArtisCase** — são puramente funcionais. Nenhuma alteração necessária no admin além de garantir que as Edge Functions subjacentes estejam funcionando (Fases 1-2).

---

### Resumo de Arquivos por Fase

| Fase | Arquivos | Total |
|------|----------|-------|
| 1 - Secrets | 5 secrets + 1 upload | 6 ações |
| 2 - Edge Functions | 5 arquivos | 5 |
| 3 - Email Templates | 6 arquivos | 6 |
| 4 - Frontend | 9 arquivos | 9 |
| 5 - Domínio/Email | Configuração | 2 ações |
| **Total** | | **~22 itens** |

### Ordem de Execução Recomendada

Fase 1 primeiro (sem os secrets nada funciona), depois Fases 2+3+4 podem ser feitas em paralelo, e Fase 5 por último quando tudo estiver pronto.

