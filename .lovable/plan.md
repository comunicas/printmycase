

## Por que você não vê a barra fixa

A página atual (`/colecao/creative/capa-personalizada-heck-yeah`) é o **DesignPage** — fluxo de compra direto de design pronto. A sticky bar mobile foi implementada apenas em `Checkout.tsx` (fluxo de imagem customizada do usuário). Ambas têm o mesmo botão "Finalizar Pedido", mas só uma foi atualizada.

## Solução: aplicar a mesma sticky bar em `DesignPage.tsx`

### Mudanças em `src/pages/DesignPage.tsx`

**1. Container principal** (linha 199): adicionar `pb-28 lg:pb-10` ao `<main>` para o conteúdo não ficar oculto sob a barra.

**2. Botão "Finalizar Pedido"** (linhas 305-315): adicionar `hidden lg:flex` para ocultá-lo no mobile (mantém inline no desktop).

**3. Nova sticky bar mobile** após o `</main>` (antes do modal de zoom, linha 322):

```tsx
<div
  className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
  style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
>
  <div className="max-w-xl mx-auto flex items-center gap-3 px-4 py-3">
    <div className="flex flex-col leading-tight">
      <span className="text-xs text-muted-foreground">Total</span>
      <span className="text-base font-semibold text-foreground">
        {formatPrice((design.price_cents + shippingCents) / 100)}
      </span>
    </div>
    <Button
      className="flex-1 gap-1.5"
      onClick={handleCheckout}
      disabled={checkoutLoading || !selectedProductId || !isAddressValid}
    >
      {checkoutLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Finalizar <ArrowRight className="w-4 h-4" /></>}
    </Button>
  </div>
</div>
```

### Resultado
- Mobile (`/colecao/.../...`): barra fixa no rodapé com Total + botão Finalizar, mesmo padrão do `/checkout/:id`
- Desktop: comportamento inalterado, botão inline preservado
- Total mostrado sempre (mesmo sem CEP) usando apenas o preço do produto até o frete carregar

### Arquivos
- `src/pages/DesignPage.tsx` — apenas as 3 mudanças acima

### Fora de escopo
- Não duplicar lógica em componente compartilhado agora (ambos os fluxos têm validações ligeiramente diferentes — refator pode vir depois)
- Não mexer em desktop, `OrderSummary`, `AddressForm`, `PaymentBadges`

