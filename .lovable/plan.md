

## Adicionar animação de feedback no botão de download

### Alteração

**`src/components/customize/ContinueBar.tsx`**

Adicionar estado local `downloading` que controla uma animação visual ao clicar:

1. Importar `useState` e `Check` do lucide-react
2. Criar estado `downloading` (boolean) no componente
3. No `onClick` do botão download: setar `downloading = true`, chamar `onDownload()`, após 1.5s voltar para `false`
4. Quando `downloading === true`: trocar ícone `<Download>` por `<Check>` com classe `animate-scale-in text-green-600`, e texto muda para "Baixado!"
5. Adicionar `transition-all duration-200` ao botão para transição suave de cores

### Resultado visual
- Clique → ícone vira ✓ verde + texto "Baixado!" por 1.5s → volta ao normal
- Feedback instantâneo sem toast, direto no botão

### Arquivo afetado
- `src/components/customize/ContinueBar.tsx`

