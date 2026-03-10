

## Implementação do Microsoft Clarity com Tagging e Funil de Vendas

### Visão geral

Integrar o Clarity (ID `vtca7ojltd`) com eventos customizados que mapeiam o funil de vendas completo da ArtisCase, identificação de usuários logados e tags de comportamento.

### Funil de vendas mapeado

```text
Landing → Catálogo → Produto → Personalizar → Checkout → Sucesso
  (1)       (2)        (3)        (4)           (5)       (6)
```

### Arquivos

**1. `src/lib/clarity.ts` (novo)**
- Declaração de tipo global `window.clarity`
- Helper `clarityEvent(name: string)` — chama `window.clarity("event", name)`
- Helper `clarityIdentify(userId: string, email?: string)` — chama `window.clarity("identify", userId, …)`
- Helper `clarityTag(key: string, value: string)` — chama `window.clarity("set", key, value)`

**2. `index.html`**
- Inserir o script do Clarity no `<head>` (inline, antes do module script)

**3. `src/contexts/AuthContext.tsx`**
- Após login/session restore, chamar `clarityIdentify(user.id, user.email)` para associar sessões a usuários

**4. `src/hooks/useClarityFunnel.ts` (novo)**
- Hook que usa `useLocation()` para detectar mudanças de rota e disparar eventos de funil automaticamente:
  - `/` → `funnel_landing`
  - `/catalog` → `funnel_catalog`
  - `/product/*` → `funnel_product_view`
  - `/customize/*` → `funnel_customize`
  - `/checkout/*` (não success) → `funnel_checkout`
  - `/checkout/success` → `funnel_purchase_complete`
- Também dispara tags: `clarityTag("funnel_step", stepName)`

**5. `src/App.tsx`**
- Adicionar `<ClarityFunnelTracker />` dentro do `<BrowserRouter>` para ativar o tracking de rotas

**6. Eventos extras em páginas-chave**
- `src/pages/Customize.tsx` — evento `customize_image_uploaded` ao fazer upload, `customize_filter_applied` ao aplicar filtro IA
- `src/pages/Checkout.tsx` — evento `checkout_address_filled` ao preencher endereço, `checkout_payment_started` ao clicar pagar
- `src/pages/Signup.tsx` / `src/pages/Login.tsx` — evento `auth_signup` / `auth_login` no sucesso

### Tags customizadas

| Tag Key | Valor | Onde |
|---|---|---|
| `funnel_step` | Nome do passo atual | Hook de rota |
| `user_type` | `logged_in` / `anonymous` | AuthContext |
| `product_viewed` | slug do produto | Product page |

### Resultado

O Clarity mostrará heatmaps e session recordings já segmentados por etapa do funil. No dashboard do Clarity, será possível filtrar sessões por `funnel_step`, `user_type` e eventos customizados para analisar drop-off entre cada etapa.

### Arquivos alterados
- `index.html` — script Clarity
- `src/lib/clarity.ts` — novo, helpers tipados
- `src/hooks/useClarityFunnel.ts` — novo, tracking automático de funil
- `src/App.tsx` — montar tracker
- `src/contexts/AuthContext.tsx` — identify
- `src/pages/Customize.tsx` — eventos de upload/filtro
- `src/pages/Checkout.tsx` — eventos de checkout
- `src/pages/Login.tsx` — evento auth_login
- `src/pages/Signup.tsx` — evento auth_signup

