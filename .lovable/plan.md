

## Plano: Atualizar Pixel ID da Meta

O Pixel ID atual (`1617415106170829`) precisa ser substituído pelo novo (`772617998947470`) em 3 arquivos:

### Alterações

1. **`index.html`** — Atualizar o ID no `fbq('init', ...)` e no `<noscript>` fallback
2. **`supabase/functions/meta-capi/index.ts`** — Atualizar a constante `PIXEL_ID`
3. **`ARCHITECTURE.md`** — Atualizar a referência de documentação

Todas as alterações são simples substituições de string do ID antigo pelo novo.

