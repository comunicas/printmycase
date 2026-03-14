

## Adicionar valor e nome do produto no botão Finalizar

### Alterações

| Arquivo | Mudança |
|---|---|
| `src/components/customize/ContinueBar.tsx` | Adicionar props `productName` e `priceCents`. Exibir nome do modelo e preço formatado no botão: "Finalizar · Galaxy A56 · R$ 69,90 →". No mobile, versão compacta: "Finalizar · R$ 69,90 →" |
| `src/pages/Customize.tsx` | Passar `productName={c.productName}` e `priceCents={c.product?.price_cents}` ao `ContinueBar` |

### Estrutura do botão

```text
Mobile:  [↺]                    [Finalizar · R$ 69,90 →]
Desktop: [    Finalizar · Galaxy A56 · R$ 69,90 →    ]
```

- Texto do botão muda de "Continuar" para "Finalizar"
- Preço formatado com `formatPrice` de `src/lib/types.ts`
- No desktop mostra nome do modelo; no mobile omite para caber

