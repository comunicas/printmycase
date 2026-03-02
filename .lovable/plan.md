
# Limpeza e Correcao de Problemas no Codigo

## Problemas Identificados

### 1. Classe CSS inexistente: `hover-parent-opacity`
No `PhonePreview.tsx` (linha 87), o overlay com o icone de Move usa a classe `hover-parent-opacity`, que nao existe em nenhum CSS do projeto. O icone nunca aparece.

**Solucao**: Substituir por logica CSS funcional usando `group-hover:opacity-100` do Tailwind, aplicando `group` no container pai.

### 2. Arquivo orfao: `src/assets/sample-case.jpg`
O arquivo `sample-case.jpg` nao e mais importado em nenhum lugar apos a remocao da imagem padrao.

**Solucao**: Deletar o arquivo.

### 3. Conflito de filtros duplicados
Quando um filtro AI esta ativo (ex: Vivid = `brightness(1.1) contrast(1.2) saturate(1.3)`) e o usuario tambem ajusta brilho/contraste manualmente, ambos sao concatenados no CSS (`baseFilter + extraFilter`), causando dupla aplicacao de `brightness()` e `contrast()`.

**Solucao**: Quando um filtro AI estiver ativo, desabilitar os ajustes manuais de brilho e contraste (ou resetar para 0). Isso evita conflito e simplifica a experiencia.

### 4. Variaveis CSS duplicadas no `index.css`
As variaveis `--sidebar-accent`, `--sidebar-bg`, `--sidebar-fg`, etc. estao definidas duas vezes no `:root` (linhas 39-43 e 48-55), causando sobreposicao.

**Solucao**: Remover as variaveis duplicadas/legadas (linhas 39-43).

## Arquivos Modificados

1. **`src/components/PhonePreview.tsx`** — Corrigir hover do icone Move com `group`/`group-hover`
2. **`src/assets/sample-case.jpg`** — Deletar arquivo orfao
3. **`src/pages/Index.tsx`** — Resetar brilho/contraste ao ativar filtro AI; resetar filtro ao ajustar manualmente
4. **`src/index.css`** — Remover variaveis CSS sidebar duplicadas
