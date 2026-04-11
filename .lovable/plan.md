

## Isentar Upscale da validação de imagem pequena + melhorar feedback

### Problema
A validação bloqueia todos os filtros (incluindo Upscale) quando a imagem é menor que 256×256px, e exibe um toast vermelho agressivo de erro. O Upscale deveria funcionar em qualquer tamanho, e o feedback para outros filtros deve ser informativo, não alarmante.

### Alterações

**1. `src/lib/customize-types.ts`** — Adicionar `model_url` à interface `AiFilter`
- Novo campo: `model_url?: string | null`

**2. `src/services/customize/filters.ts`** — Incluir `model_url` no select
- Alterar query para incluir `model_url`

**3. `src/hooks/customize/useCustomizeFilters.ts`** — Duas mudanças:
- **Pular validação para upscale**: buscar o filtro selecionado, verificar se `model_url` contém `"aura-sr"`, e se sim, pular o check de 256×256
- **Melhorar feedback**: trocar `variant: "destructive"` por toast padrão (sem vermelho), e reescrever a mensagem para algo amigável:
  - Título: `"Resolução muito baixa para este filtro"`
  - Descrição: `"Sua imagem tem menos de 256×256px. Aplique o filtro Upscale IA primeiro para aumentar a resolução e depois tente novamente."`
  - Sem `variant: "destructive"` — usa o estilo padrão do toast (neutro/informativo)

### Lógica principal
```typescript
const selectedFilter = filters.find(f => f.id === filterId);
const isUpscaleFilter = selectedFilter?.model_url?.includes("aura-sr");

if (!isUpscaleFilter && imageResolution && (imageResolution.w < 256 || imageResolution.h < 256)) {
  toast({
    title: "Resolução muito baixa para este filtro",
    description: "Sua imagem tem menos de 256×256px. Aplique o filtro Upscale IA primeiro para aumentar a resolução e depois tente novamente.",
  });
  return;
}
```

