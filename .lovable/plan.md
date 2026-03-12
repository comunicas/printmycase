

## Gatilhos Rápidos de Prompt no Gerador IA

Adicionar 3 botões clicáveis acima do campo de prompt que preenchem o texto ao clicar.

### Arquivo alterado

**`src/components/admin/AiImageGenerator.tsx`**

- Array constante `QUICK_PROMPTS` com os 3 textos fornecidos e labels curtos ("Still Matte", "Fundo Branco RGB", "Arte Fosca")
- Renderizar chips/botões clicáveis entre as imagens de referência e o campo de prompt
- Ao clicar, `setPrompt(texto)` — substitui o conteúdo atual
- Estilo: `Button variant="outline" size="sm"` com ícone `Sparkles` ou `Zap`

