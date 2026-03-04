

# Reset Geral + Rascunho Automático

## 1. Botão de Reset Geral
Adicionar um botão "Resetar" ao lado do título "Customizar" em `src/pages/Customize.tsx`. Ao clicar, volta todos os ajustes ao padrão:
- `scale → 100`, `rotation → 0`, `brightness → 0`, `contrast → 0`
- `activeFilter → null`, `position → { x: 50, y: 50 }`
- Mantém a imagem (não remove o upload)
- Botão só aparece/fica ativo quando algum valor difere do padrão
- Ícone `RotateCcw` do lucide-react

## 2. Rascunho Automático (sessionStorage)
Salvar estado da customização automaticamente no `sessionStorage` com chave `draft-customize-{slug}`:
- **Salvar**: via `useEffect` com debounce simples (setTimeout 500ms) sempre que qualquer estado mudar
- **Restaurar**: no mount, checar se existe rascunho para o produto atual e restaurar todos os valores (incluindo imagem base64)
- **Limpar**: ao clicar "Continuar" (já salva como `customization` para o checkout) e ao clicar "Resetar"
- Mostrar toast discreto "Rascunho restaurado" quando um rascunho é carregado

## Arquivos afetados

- **`src/pages/Customize.tsx`** — adicionar botão reset, lógica de salvar/restaurar rascunho via sessionStorage, useEffect para auto-save

