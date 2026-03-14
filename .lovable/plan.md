

## Adicionar saldo de moedas no header da customização

Adicionar o componente `CoinBalance` no header da página de customização, ao lado do indicador "✓ Salvo".

### Alteração

| Arquivo | Mudança |
|---|---|
| `src/components/customize/CustomizeHeader.tsx` | Importar e renderizar `<CoinBalance />` no lado direito do header (onde está o `<div className="w-8" />` placeholder), substituindo o spacer vazio |

### Estrutura

```text
┌──────────────────────────────────────────┐
│ ←  │ [thumb] Galaxy A56 ✓ Salvo │ 🪙 50 │
└──────────────────────────────────────────┘
```

O `CoinBalance` já trata o caso de usuário não logado (retorna `null`), então não precisa de lógica condicional extra.

