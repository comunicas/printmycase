
## Padronizar TermsDialog como fullscreen mobile

A `TermsDialog` está aparecendo como card centralizado mesmo no mobile (390x844), e os botões da MobileTabBar/ContinueBar continuam visíveis atrás. Solução: aplicar o mesmo padrão fullscreen-mobile usado no `IntroDialog` e `UploadSpotlight`.

### Mudança em `src/components/customize/TermsDialog.tsx`

Adicionar classes ao `DialogContent` para fullscreen no mobile:

```tsx
<DialogContent className="w-screen h-[100dvh] max-w-full rounded-none p-6 overflow-y-auto sm:w-full sm:h-auto sm:max-w-md sm:rounded-lg sm:max-h-[90dvh] gap-3 flex flex-col justify-center">
```

Isso garante:
- **Mobile (<640px)**: cobre 100% da tela, sem cantos arredondados, conteúdo centralizado verticalmente — cobrindo a MobileTabBar/ContinueBar atrás
- **Desktop (≥640px)**: mantém o card centralizado de até `max-w-md` com cantos arredondados (comportamento atual preservado)

Mudança mínima em 1 linha (className do DialogContent). Nenhum outro arquivo afetado.
