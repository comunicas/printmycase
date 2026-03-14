

## Corrigir botão "Upscale IA" no alerta vermelho para exigir login

O botão "✨ Upscale IA" nos toasts de qualidade baixa/média chama `setShowUpscaleDialog(true)` diretamente, pulando a verificação de autenticação. Deve usar `handleUpscaleClick` que já faz `requireAuth()`.

### Alteração

| Arquivo | Mudança |
|---|---|
| `src/hooks/useCustomize.tsx` | Nas linhas 206 e 213, trocar `onClick={() => setShowUpscaleDialog(true)}` por `onClick={() => handleUpscaleClick()}` nos dois ToastAction dos toasts de qualidade (baixa e média) |

Como `handleUpscaleClick` já faz `requireAuth()` internamente, o dialog de login aparecerá automaticamente para usuários não logados.

