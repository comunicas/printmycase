

## Otimizar LCP: Logo Estático em vez de Base64 Inline

### Problema
O Vite inline o arquivo `logo-printmycase-sm.webp` como base64 dentro do bundle JS. O browser só renderiza o logo após baixar + parsear + executar o JS — adicionando ~1.2s de "Element Render Delay" ao LCP.

### Solução
Mover o logo para `/public/` e referenciá-lo como caminho estático. Assim o browser pode começar a baixar a imagem assim que parseia o HTML, sem esperar pelo JS.

### Mudanças

**1. Copiar asset para `/public/`**
- Copiar `src/assets/logo-printmycase-sm.webp` → `public/logo-printmycase-sm.webp`

**2. `src/components/AppHeader.tsx`**
- Remover `import logoWebp from "@/assets/logo-printmycase-sm.webp"`
- Trocar `src={logoWebp}` por `src="/logo-printmycase-sm.webp"`

**3. `src/pages/Landing.tsx`**
- Remover `import logoPrintMyCase from "@/assets/logo-printmycase-sm.webp"`
- Usar `"/logo-printmycase-sm.webp"` diretamente

**4. `src/pages/CheckoutSuccess.tsx`**
- Mesma troca de import → string estática

**5. `index.html` — preload do logo**
- Adicionar `<link rel="preload" as="image" type="image/webp" href="/logo-printmycase-sm.webp" fetchpriority="high" />` no `<head>` para iniciar download ainda antes do CSS/JS

### Resultado
- Logo carrega em paralelo com JS (não depende mais de execução)
- Preload garante prioridade máxima no download
- ~1.2s de render delay eliminado do LCP
- 4 arquivos modificados, 1 asset copiado

