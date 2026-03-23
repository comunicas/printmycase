

## Análise completa e correções do fluxo de customização

### Estado atual

Os logs confirmam que o fluxo básico funciona: filtro aplicado com sucesso (style-transfer pixel_art, 200 OK, moedas debitadas, resultado salvo no storage). Os edge functions estão otimizados com URLs.

### Problemas encontrados

| # | Problema | Impacto |
|---|---------|---------|
| 1 | `compressForAI` não define `img.crossOrigin = "anonymous"` | **Crítico**: No segundo filtro sequencial, o source é uma URL do storage (signed URL). O canvas fica "tainted" e `toDataURL()` lança erro. O fluxo sequencial **quebra silenciosamente**. |
| 2 | `compressForAI` não tem `img.onerror` | Se a URL falhar, a Promise nunca resolve (fica pendurada para sempre) |
| 3 | `uploadForAI` re-comprime e re-upload desnecessariamente | No segundo filtro, a imagem já está no storage em 720x1280 (saída do fal.ai). Comprimir para 640x1136 degrada qualidade sem necessidade. Deveria passar a signed URL direto. |
| 4 | Warnings de ref em `LoginDialog` e `UpscaleConfirmDialog` | Componentes funcionais recebendo ref sem `forwardRef` — não quebra mas polui o console |

### Plano de correção

**1. `src/lib/image-utils.ts` — `compressForAI` + `uploadForAI`**

- Adicionar `img.crossOrigin = "anonymous"` em `compressForAI`
- Adicionar `img.onerror` com reject
- Em `uploadForAI`: detectar se `dataUrl` já é uma URL HTTP (signed URL do storage). Se sim, pular compress+upload e retornar a URL diretamente (já está pronta para o fal.ai)

```typescript
export async function uploadForAI(
  src: string,
  userId: string,
  supabaseClient: ...,
): Promise<{ path: string; signedUrl: string }> {
  // Se já é uma URL HTTP (resultado de filtro anterior no storage), usar direto
  if (src.startsWith("http")) {
    return { path: "", signedUrl: src };
  }
  // Caso contrário, comprimir e fazer upload normalmente
  ...
}
```

**2. `src/components/customize/LoginDialog.tsx`** — Adicionar `forwardRef` ou remover ref passthrough

**3. `src/components/customize/UpscaleConfirmDialog.tsx`** — Mesmo fix de ref

### Arquivos afetados
| Arquivo | Alteração |
|---------|-----------|
| `src/lib/image-utils.ts` | CORS fix + onerror + skip upload para URLs HTTP |
| `src/components/customize/LoginDialog.tsx` | Fix warning de ref |
| `src/components/customize/UpscaleConfirmDialog.tsx` | Fix warning de ref |

