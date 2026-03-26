

## Adicionar Aviso de IA nos Dialogs de Confirmação

### Problema
Os dialogs de confirmação de filtro IA e upscale IA não informam o usuário que os resultados podem variar.

### Solução
Adicionar o texto "Imagens por IA podem variar. Revise antes de finalizar." nos dois dialogs de confirmação:

**1. `src/components/customize/FilterConfirmDialog.tsx`**
- Adicionar `<p>` com o aviso entre o custo em moedas e os botões (após linha 53)

**2. `src/components/customize/UpscaleConfirmDialog.tsx`**
- Adicionar `<p>` com o mesmo aviso na mesma posição (após linha 48)

Formato: `<p className="text-[11px] text-muted-foreground text-center">Imagens por IA podem variar. Revise antes de finalizar.</p>`

### Resultado
- 2 arquivos modificados
- Texto discreto visível antes do usuário confirmar qualquer geração IA

