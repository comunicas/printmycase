

## Adicionar evento `CompleteRegistration` do Meta Pixel

Disparar `fbq('track', 'CompleteRegistration')` nos dois pontos onde um cadastro é concluído com sucesso:

| Arquivo | Mudança |
|---|---|
| `src/pages/Signup.tsx` | Adicionar `pixelEvent("CompleteRegistration")` após `clarityEvent("auth_signup")` (linha ~50) |
| `src/components/customize/LoginDialog.tsx` | Adicionar `pixelEvent("CompleteRegistration")` após `clarityEvent("auth_signup")` na aba de signup (linha ~68) |

Ambos os arquivos já importam de `@/lib/clarity`; basta adicionar o import de `pixelEvent` de `@/lib/meta-pixel` e uma linha extra em cada handler de signup bem-sucedido.

