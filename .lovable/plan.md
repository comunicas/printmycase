

## Plano: Notificações Intuitivas com CTA de Upscale

### Problema
Os alertas de qualidade (resolução baixa/muito baixa) e o aviso de "imagem muito pequena" usam toasts destrutivos genéricos sem ação. O badge "Baixa" no mockup não oferece caminho de solução. O usuário não entende que pode usar o Upscale IA para resolver.

### Solução

#### 1. Toast com CTA de Upscale — Resolução Baixa

**`src/pages/Customize.tsx`** — Nos toasts de resolução baixa (linhas 174-178), adicionar um `action` com botão "Upscale IA ✨" que abre o diálogo de upscale diretamente:

```tsx
toast({
  title: "Resolução baixa",
  description: `${w}×${h}px — use o Upscale IA para melhorar.`,
  action: <ToastAction altText="Upscale" onClick={() => setShowUpscaleDialog(true)}>
    ✨ Upscale IA
  </ToastAction>,
});
```

- Resolução crítica (< 400×800): toast destrutivo com CTA de upscale
- Resolução baixa (< 800×1600): toast padrão com CTA de upscale
- Ambos explicam a solução em vez de só alertar

#### 2. Toast de "Imagem muito pequena" — Mais explicativo

**`src/pages/Customize.tsx`** (linha 197) — Trocar mensagem genérica por orientação clara:

```
"Envie uma imagem maior (mín. 256×256px) ou use o Upscale IA primeiro."
```

Com CTA para upscale quando resolução >= 256 em pelo menos uma dimensão, ou CTA "Trocar imagem" para acionar o input de arquivo.

#### 3. Badge "Baixa" no PhonePreview — Tooltip ou tap-to-action

**`src/components/PhonePreview.tsx`** (linhas 272-282):
- Adicionar `onUpscaleClick` como prop opcional
- Quando badge é "Baixa" ou "Média" e `onUpscaleClick` existe, tornar o badge clicável com ícone de ✨
- Ao clicar, dispara o diálogo de upscale

```tsx
<button onClick={onUpscaleClick} className="... flex items-center gap-0.5">
  Baixa <Sparkles className="w-2.5 h-2.5" />
</button>
```

#### 4. Texto mais amigável nos toasts existentes

| Toast atual | Novo texto |
|---|---|
| "Resolução muito baixa" | "Qualidade baixa para impressão" |
| "Resolução baixa" | "Qualidade pode melhorar" |
| "Imagem muito pequena" (filtros) | "Imagem pequena demais para filtros" |
| "Moedas insuficientes" | Manter (já está claro) |

### Arquivos Modificados

| Arquivo | Mudança |
|---|---|
| `src/pages/Customize.tsx` | Toasts com `action` CTA de upscale, textos mais claros |
| `src/components/PhonePreview.tsx` | Badge clicável com `onUpscaleClick` prop, ícone ✨ |

