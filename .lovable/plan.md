

## Fix: imagens geradas não aparecem no smartphone

### Problema raiz

Dois problemas combinados impedem a exibição:

1. **`urlToDataUrl` falha silenciosamente para URLs fal.ai** — A função usa `img.crossOrigin = "anonymous"` + canvas, mas fal.ai pode não enviar o header CORS necessário. O `catch` cai no fallback (URL bruta), mas a URL bruta como `backgroundImage: url(...)` também pode falhar se fal.ai bloquear hotlinking ou se a URL expirou.

2. **CSS `url()` sem aspas** — `buildImageStyle` gera `url(${src})` sem aspas. Se `src` contém caracteres especiais (ou é uma URL longa com query params), o CSS quebra silenciosamente. Data URLs com `;base64,` e URLs com `?` precisam de aspas.

### Correções

**1. `src/components/PhonePreview.tsx` — Adicionar aspas no CSS url()**

```js
// Antes
backgroundImage: `url(${src})`,

// Depois
backgroundImage: `url("${src}")`,
```

**2. `src/lib/image-utils.ts` — `urlToDataUrl` mais robusto**

Usar `fetch()` + `blob()` + `FileReader` ao invés de canvas com CORS (mesmo approach do `handleDownload`):

```js
export async function urlToDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
```

Isso evita o problema de CORS do canvas — `fetch` para URLs externas funciona sem restrição de canvas tainted.

**3. `src/hooks/useCustomize.tsx` — Logging no fallback**

Adicionar `console.warn` quando `urlToDataUrl` falha para facilitar debug futuro:

```js
try { resultImage = await urlToDataUrl(data.imageUrl); }
catch (e) {
  console.warn("[urlToDataUrl] fallback to raw URL:", e);
  resultImage = data.imageUrl;
}
```

### Arquivos afetados
| Arquivo | Alteração |
|---------|-----------|
| `src/components/PhonePreview.tsx` | Aspas no CSS `url()` |
| `src/lib/image-utils.ts` | `urlToDataUrl` via fetch+blob |
| `src/hooks/useCustomize.tsx` | Console.warn no catch |

