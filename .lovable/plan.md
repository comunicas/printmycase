## Objetivo
Enriquecer o evento `AddToCart` enviado via Meta CAPI com mais parâmetros de user data para melhorar a qualidade da correspondência (EMQ).

## Parâmetros recomendados pelo Meta — disponibilidade no nosso projeto

| Parâmetro | Fonte no projeto | Vamos enviar? |
|---|---|---|
| `em` (email) | `auth.users.email` (já temos via JWT claims) | Sim |
| `external_id` | `auth.users.id` (UUID) | Sim |
| `fn` (first name) | `profiles.full_name` (split) | Sim |
| `ln` (last name) | `profiles.full_name` (split) | Sim |
| `ph` (phone) | `profiles.phone` | Sim (já existia, vamos garantir) |
| `zp` (zip) | `addresses.zip_code` (endereço default ou mais recente) | Sim |
| `ct` (city) | `addresses.city` | Sim |
| `st` (state) | `addresses.state` | Sim |
| `client_ip_address` | header da request | Sim (já existe) |
| `client_user_agent` | navigator.userAgent | Sim (já existe) |
| `fbp` / `fbc` | cookies `_fbp` / `_fbc` | Sim (novo) |
| `db` (dob) | não armazenado | Não enviar |
| `fb_login_id` | não usamos Facebook Login | Não enviar |

## Mudanças

### 1. `supabase/functions/meta-capi/index.ts`
- Aceitar (e hashear) novos campos opcionais em `user_data`: `external_id`, `ln`, `ct`, `st`, `zp`, `db`, `fbp`, `fbc`.
- Conforme spec do Meta: `em, fn, ln, ph, ct, st, zp, db, external_id` → SHA-256 lowercased/trimmed; `fbp`, `fbc`, `client_ip_address`, `client_user_agent` → enviados em texto puro.
- Manter compatibilidade com chamadas existentes (todos os campos opcionais).

### 2. Novo helper para enriquecer AddToCart no client
`src/services/customize/ai.ts` — `invokeMetaCapiAddToCart`:
- Receber `userId`.
- Antes de chamar `meta-capi`, buscar em paralelo:
  - `auth.getUser()` → email, id.
  - `profiles` → `full_name`, `phone` (split full_name em fn/ln pela primeira espaço).
  - `addresses` (do user, `order by created_at desc limit 1`) → `zip_code`, `city`, `state`.
- Ler cookies `_fbp` e `_fbc` do `document.cookie`.
- Enviar tudo como texto puro no `user_data`; o edge function hasheia.

### 3. `src/hooks/customize/useCustomizeTracking.ts`
- Pegar `user` do `useAuth()` e passar `userId` ao `invokeMetaCapiAddToCart`.
- Fallback: se não houver user logado, envia só `fbp`/`fbc` + UA/IP (como hoje).

### 4. `supabase/functions/create-checkout/index.ts`
- O `InitiateCheckout` lá dentro só envia `em`. Aplicar o mesmo enriquecimento server-side (já temos service role, podemos buscar profile + último address) e cookies `fbp`/`fbc` se vierem do client.
- Aceitar `fbp`/`fbc` opcionais no body do `create-checkout` e repassar.

### 5. `supabase/functions/stripe-webhook/index.ts` (verificar)
- Se enviar `Purchase` via CAPI, aplicar mesmo enriquecimento (vou inspecionar e ajustar se aplicável).

## Notas técnicas
- Hash sempre lowercase + trim antes de SHA-256, exceto IP/UA/fbp/fbc.
- Telefone: remover não-dígitos e prefixar `55` se não tiver código de país, antes de hashar (recomendação Meta para BR).
- Nome: lowercase, sem acentos opcional — manteremos só lowercase+trim (suficiente).
- Não logar PII em `console.log` (somente o nome do evento).
- Sem mudanças de schema do banco.

## Entregável
Após aprovar, eu:
1. Atualizo `meta-capi` para suportar todos os campos.
2. Atualizo client `invokeMetaCapiAddToCart` + hook para enriquecer.
3. Atualizo `create-checkout` (InitiateCheckout) e, se aplicável, `stripe-webhook` (Purchase).
4. Faço deploy das edge functions e valido com um AddToCart de teste vendo o EMQ no Events Manager.