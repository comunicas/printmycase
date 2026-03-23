

## Code Review e Refatoração da Customização

### Problemas encontrados

**1. Tipo legado `cssFilter` nas props de `AiFiltersList` e `ImageControls`**
A prop `onPreviewStart` ainda é tipada como `(cssFilter: string) => void` em ambos os componentes, mas agora recebe uma URL de imagem (não CSS). O nome do parâmetro está errado e pode confundir.

**2. Campo `preview_css` ainda carregado sem uso**
- `useCustomize.tsx` (linha 84) ainda faz `select("id, name, style_image_url, preview_css")` — o campo `preview_css` não é mais usado no frontend (a prévia usa `style_image_url`)
- `customize-types.ts` mantém `preview_css: string | null` no tipo `AiFilter` — não usado
- O campo existe no banco e no admin, o que é ok para configuração futura, mas o frontend não precisa buscá-lo

**3. Variável `remaining` não usada em `FilterConfirmDialog`**
Linha 32: `const remaining = balance - cost;` — nunca referenciada após a simplificação da modal.

**4. `.lovable/plan.md` desatualizado**
Contém o plano antigo já implementado. Deve ser atualizado com o estado atual.

**5. Timeout inconsistente entre edge functions**
- `apply-ai-filter`: 120s (correto, style-transfer é lento)
- `upscale-image`: 50s (pode ser curto para imagens grandes — alinhar com 120s)

**6. Documentação `ARCHITECTURE.md` desatualizada**
- Não menciona long-press preview, download com blob, nem persistência de `filteredImage`
- Seção "Filtros IA" descreve comportamento antigo ("chips com thumbnail circular", "crossfade de 350ms")

### Plano de refatoração

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | `src/components/customize/AiFiltersList.tsx` | Renomear tipo da prop `onPreviewStart` de `(cssFilter: string)` para `(imageUrl: string)` |
| 2 | `src/components/customize/ImageControls.tsx` | Renomear tipo da prop `onPreviewStart` de `(cssFilter: string)` para `(imageUrl: string)` |
| 3 | `src/lib/customize-types.ts` | Remover `preview_css` do tipo `AiFilter` (não usado no frontend) |
| 4 | `src/hooks/useCustomize.tsx` | Remover `preview_css` do select de filtros |
| 5 | `src/components/customize/FilterConfirmDialog.tsx` | Remover variável `remaining` não usada |
| 6 | `supabase/functions/upscale-image/index.ts` | Aumentar timeout de 50s para 120s (alinhar com apply-ai-filter) |
| 7 | `.lovable/plan.md` | Limpar conteúdo obsoleto |
| 8 | `ARCHITECTURE.md` | Atualizar seção Filtros IA com: long-press preview, download blob, persistência filteredImage, crossfade 200ms |

### Detalhes técnicos

**Props renomeadas** (items 1-2):
```typescript
// Antes
onPreviewStart?: (cssFilter: string) => void;
// Depois
onPreviewStart?: (imageUrl: string) => void;
```

**Tipo AiFilter** (item 3):
```typescript
// Remover preview_css — manter apenas no admin e no banco
export interface AiFilter {
  id: string;
  name: string;
  style_image_url: string | null;
}
```

**Select** (item 4):
```typescript
// Antes
.select("id, name, style_image_url, preview_css")
// Depois
.select("id, name, style_image_url")
```

**ARCHITECTURE.md** — seção Filtros IA reescrita:
- Long-press (300ms) mostra `style_image_url` como overlay no PhonePreview
- Tap curto abre modal de confirmação simplificada (apenas custo 🪙)
- Download via blob para URLs cross-origin
- Imagem filtrada persistida no storage + restaurada via `customization_data`
- Crossfade de 200ms entre imagens

