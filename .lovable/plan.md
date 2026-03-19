

## Plano: Integrar novo logo PrintMyCase

O logo foi recebido. Preciso copiá-lo para os assets do projeto, atualizar todas as referências nos componentes, e fazer upload para o bucket `email-assets` para os templates de email.

### Alterações

**1. Copiar logo para o projeto**
- Copiar `user-uploads://logo-printmycase.png` para `src/assets/logo-printmycase.png`
- Copiar para `public/lovable-uploads/logo-printmycase.png` (para AppHeader que usa path público)

**2. Atualizar imports nos componentes (4 arquivos)**

| Arquivo | De | Para |
|---------|-----|------|
| `src/pages/Landing.tsx` | `import logoArtisCase from "@/assets/logo-artiscase.webp"` | `import logoPrintMyCase from "@/assets/logo-printmycase.png"` + atualizar uso da variável |
| `src/pages/Login.tsx` | `from "@/assets/logo-artiscase.png"` | `from "@/assets/logo-printmycase.png"` |
| `src/pages/Signup.tsx` | `from "@/assets/logo-artiscase.png"` | `from "@/assets/logo-printmycase.png"` |
| `src/pages/CheckoutSuccess.tsx` | `from "@/assets/logo-artiscase.png"` | `from "@/assets/logo-printmycase.png"` |

**3. Atualizar AppHeader.tsx**
- Trocar `src="/lovable-uploads/79379ce7-..."` para `/lovable-uploads/logo-printmycase.png`

**4. Upload para bucket `email-assets`**
- Criar bucket `email-assets` (público) via migration SQL se não existir
- Fazer upload do logo via Storage API para que os templates de email funcionem

**5. Limpeza**
- Os arquivos antigos `src/assets/logo-artiscase.png` e `src/assets/logo-artiscase.webp` podem ser removidos

