

## Dois novos ajustes: Expandir Imagem + Upscale IA

### 1. Expandir Imagem (Enquadrar automaticamente)

Botão que calcula o zoom mínimo necessário para a imagem preencher 100% do frame do celular sem bordas visíveis, considerando o aspect ratio da imagem vs. o do phone (9:16). Reseta posição para centro e rotação para 0.

**Lógica**: Compara aspect ratio da imagem com o do phone. Se a imagem é mais larga que o phone, aumenta o scale para que a altura cubra. Se é mais alta, ajusta para que a largura cubra. Resultado: imagem sempre preenche o frame sem espaços.

**Arquivo**: `AdjustmentsPanel.tsx` — novo botão com ícone `Expand` do lucide.

### 2. Upscale IA (fal.ai)

Botão que envia a imagem para uma edge function que chama o modelo `fal-ai/aura-sr` (super-resolution, gratuito no fal.ai, 4x upscale). Custa ArtisCoins (configurável via `coin_settings`, nova chave `ai_upscale_cost`).

- Exibe dialog de confirmação similar ao de filtros IA (custo + saldo)
- Após upscale, atualiza `imageResolution` com as novas dimensões
- Badge de qualidade atualiza automaticamente (ex: "Baixa" → "HD")
- Botão desabilitado se imagem já é HD (≥800×1600)

**Arquivos alterados**:

| Arquivo | Mudança |
|---------|---------|
| `AdjustmentsPanel.tsx` | +2 botões (Expandir + Upscale IA) |
| `ImageControls.tsx` | Passar novas props (resolution, handlers) |
| `Customize.tsx` | Lógica de expand + handler de upscale |
| `supabase/functions/upscale-image/index.ts` | Nova edge function: valida auth, cobra coins, chama `fal-ai/aura-sr` |
| Migração SQL | Inserir `ai_upscale_cost` na `coin_settings` (default: 5) |

### Edge function `upscale-image`

```
POST { imageBase64 }
→ Valida auth + saldo
→ Chama fal.run/fal-ai/aura-sr com { image_url: base64 }
→ Converte resultado para base64
→ Debita coins
→ Retorna { image, width, height }
```

### UX dos botões

Ficam na mesma linha do "Girar 90°", como botões `variant="outline" size="sm"`:

```
[↻ Girar 90°] [⊞ Expandir] [⬆ Upscale IA ✨]
```

O botão Upscale mostra badge com custo em coins. Desabilitado se já HD.

