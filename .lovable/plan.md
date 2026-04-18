
## Investigar fluxo "Editar" do checkout

O usuário clicou em "Editar" no checkout e foi para `/customize/galaxy-a05`, mas viu o `UploadSpotlight` (modal de upload) em vez do projeto salvo (imagem + filtros aplicados).

### Investigação necessária

1. Localizar o botão "Editar" no checkout (`Checkout.tsx` / `PendingCheckoutCards.tsx`).
2. Ver para onde ele redireciona e com que estado.
3. Ver como `useCustomize` / `useCustomizeDraft` carrega o rascunho ao montar `/customize/:id`.
4. Comparar com o fluxo esperado: ao editar pending checkout, deve restaurar imagem + filtros + posição do `pending_checkouts`.
