

# Code Review Completo - Case Studio

## Problemas Encontrados

### 1. Componente orfao: `NavLink.tsx`
O arquivo `src/components/NavLink.tsx` nao e importado em nenhum lugar da aplicacao. E codigo legado sem utilidade.

**Acao**: Deletar `src/components/NavLink.tsx`.

### 2. Variaveis CSS de sidebar sem uso
As variaveis `--sidebar-*` em `src/index.css` (tanto no `:root` quanto no `.dark`) nao sao usadas por nenhum componente da aplicacao. O componente `sidebar.tsx` existe nos UI components mas nunca e importado. Sao 16 linhas de CSS morto.

**Acao**: Remover todas as variaveis `--sidebar-*` do `:root` e `.dark` no `index.css`.

### 3. Dependencias nao utilizadas no `App.tsx`
- **`@tanstack/react-query`**: `QueryClient` e `QueryClientProvider` estao configurados no `App.tsx`, mas nenhum componente usa `useQuery` ou `useMutation`. E infraestrutura sem uso.
- **`next-themes`**: Importado apenas no `sonner.tsx` para `useTheme()`, mas nao existe nenhum `ThemeProvider` na arvore de componentes. O `useTheme()` retorna sempre o valor default (`"system"`), nunca funcionando corretamente.
- **Dois sistemas de toast**: `Toaster` (radix) e `Sonner` estao ambos montados no `App.tsx`, mas nenhum dos dois e usado na aplicacao.

**Acao**: Remover `QueryClientProvider` do `App.tsx`. Remover o componente `<Sonner />` (que depende de `next-themes` sem provider). Manter apenas o `<Toaster />` do radix caso venha a ser usado.

### 4. Conflito de `group` aninhado no `PhonePreview.tsx`
Na linha 80, o container da imagem tem a classe `group`. Na linha 94, o botao de upload dentro dele tambem tem `group`. Isso causa conflito: o `group-hover` das linhas 97-98 responde ao hover do botao interno, nao do container externo. Nao causa bug visivel porque o botao ocupa 100% da area, mas e semanticamente incorreto e fragil.

**Acao**: Renomear para usar `group/image` e `group/upload` com Tailwind named groups para evitar ambiguidade.

### 5. Botoes do header sem funcionalidade
Os botoes "ArrowLeft" (voltar) e "HelpCircle" (ajuda) no header do `Index.tsx` sao `<button>` sem `onClick`. Nao fazem nada.

**Acao**: Desabilitar visualmente ou adicionar `aria-label` e `disabled` para indicar que sao placeholders.

### 6. Duplicacao de label "Adjustments"
O titulo "Adjustments" aparece duas vezes: uma na `TabsTrigger` (linha 81 do Index) e outra dentro do `ControlPanel.tsx` (linha 28). O usuario ve "Adjustments" repetido.

**Acao**: Remover o `<span>Adjustments</span>` do `ControlPanel.tsx`.

### 7. Input file nao reseta apos upload
O `<input type="file">` no `PhonePreview.tsx` nao limpa o `value` apos selecao. Se o usuario tentar fazer upload da mesma imagem novamente, o `onChange` nao dispara.

**Acao**: Adicionar `e.target.value = ''` no `handleFileChange` apos processar o arquivo.

## Resumo de Arquivos Modificados

1. **Deletar** `src/components/NavLink.tsx` -- componente orfao
2. **`src/index.css`** -- remover variaveis `--sidebar-*`
3. **`src/App.tsx`** -- remover QueryClientProvider, remover Sonner
4. **`src/components/PhonePreview.tsx`** -- corrigir group aninhado, resetar input file
5. **`src/components/ControlPanel.tsx`** -- remover label duplicado "Adjustments"
6. **`src/pages/Index.tsx`** -- adicionar disabled/aria nos botoes do header

