
## Diagnóstico provável

O projeto já envia `InitiateCheckout` com `value` e `currency` em `src/pages/Checkout.tsx`, então o alerta da Meta indica que existe **outro disparo de `InitiateCheckout` sem parâmetros**.

Pelo código atual, há 2 pontos importantes:

1. `Checkout.tsx` já faz:
   - `pixelEvent("InitiateCheckout", { content_ids, content_type, value, currency }, eventId)`

2. `DesignPage.tsx` **não** dispara Pixel no cliente:
   - ele só manda `initiate_checkout_event_id` para a função `create-checkout`
   - a função backend envia CAPI com `value` e `currency`
   - então, se houver disparo de Pixel nessa jornada, ele provavelmente vem de uma configuração externa da Meta (Event Setup Tool) ou de outro clique genérico sem payload

Isso explica o alerta “Pixel da Meta | value e currency ausentes”: o CAPI pode estar correto, mas o **evento do navegador** está incompleto ou duplicado.

## Correção recomendada

### 1. Padronizar o disparo de `InitiateCheckout` no frontend
Criar uma função dedicada para `InitiateCheckout` e usar sempre a mesma estrutura.

#### Implementação
- Em `src/lib/meta-pixel.ts`, adicionar helper como:
  - `pixelTrackInitiateCheckout(valueBRL, contentId, eventId?)`
- Esse helper deve sempre enviar:
  - `value`
  - `currency: "BRL"`
  - `content_ids`
  - `content_type: "product"`

### 2. Usar essa função em `Checkout.tsx`
Substituir o `pixelEvent("InitiateCheckout", ...)` inline por `pixelTrackInitiateCheckout(...)` para evitar divergência futura.

### 3. Adicionar `InitiateCheckout` também em `DesignPage.tsx`
Hoje a página de design já cria `initiateCheckoutEventId`, mas não dispara o Pixel antes de chamar `create-checkout`.

#### Ajuste
No `handleCheckout` de `src/pages/DesignPage.tsx`:
- disparar `pixelTrackInitiateCheckout(...)` antes de `supabase.functions.invoke("create-checkout", ...)`
- usar o mesmo `initiateCheckoutEventId.current` já existente para manter deduplicação com o CAPI

Isso cobre a jornada de compra direta da página de design, que hoje depende só do backend para `InitiateCheckout`.

### 4. Revisar configuração externa da Meta
Como só há um disparo explícito no código, é bem provável que exista um `InitiateCheckout` criado fora do repositório.

#### Verificar e remover
Na Meta:
- abrir **Gerenciador de Eventos**
- revisar se existe `InitiateCheckout` criado por:
  - Event Setup Tool
  - clique automático em botão
  - regra de parceiro/app
- remover qualquer evento de navegador que dispare `InitiateCheckout` sem payload
- manter apenas os disparos controlados pelo código

Se isso não for removido, a Meta continuará vendo eventos incompletos mesmo após o ajuste no app.

## Validação

### Teste no navegador
Usar a ferramenta **Test Events** da Meta e confirmar que, ao iniciar checkout:
- existe apenas 1 evento Pixel `InitiateCheckout` por ação relevante
- o payload inclui:
  - `value`
  - `currency`
  - `content_ids`
  - `content_type`

### Testes de fluxo
Validar em:
- `/checkout/:id`
- `/colecao/:collectionSlug/:designSlug` ao clicar para finalizar compra

### Resultado esperado
O evento `InitiateCheckout` deve aparecer com:
```json
{
  "value": 129.9,
  "currency": "BRL",
  "content_ids": ["..."],
  "content_type": "product"
}
```

## Arquivos a alterar
- `src/lib/meta-pixel.ts` — criar helper específico para `InitiateCheckout`
- `src/pages/Checkout.tsx` — trocar disparo inline pelo helper
- `src/pages/DesignPage.tsx` — adicionar disparo de Pixel antes de chamar `create-checkout`

## Instruções para quem for corrigir
1. Procurar qualquer origem adicional de `InitiateCheckout` fora do código no Gerenciador de Eventos da Meta
2. Centralizar o payload do evento em um helper único
3. Garantir que `DesignPage` também envie o Pixel no cliente
4. Testar no Test Events da Meta até não aparecer mais evento sem `value` e `currency`
