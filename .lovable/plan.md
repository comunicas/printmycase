

## Code Review — Limpeza de Legado na Customização

Após análise dos 4 arquivos principais, o código está bem limpo. Encontrei **3 itens de limpeza**:

### 1. `forwardRef` não utilizado — `ControlPanel.tsx` e `PhonePreview.tsx`

Ambos os componentes usam `forwardRef`, mas nenhum pai passa `ref` para eles. O `ControlPanel` recebe `ref` e aplica no wrapper, mas `Customize.tsx` nunca usa. O `PhonePreview` recebe `ref` mas também nunca é referenciado pelo pai.

**Ação:** Remover `forwardRef` de ambos, converter para componentes funcionais simples. Remove import de `forwardRef` e a linha `displayName`.

### 2. Estado `imageFile` desnecessário — `Customize.tsx`

O estado `imageFile` (linha 88) armazena o `File` inteiro, mas é usado **apenas** para `imageFile?.name` (linha 187). Armazenar o objeto `File` completo na memória é desperdício.

**Ação:** Substituir `imageFile: File | null` por `imageFileName: string | null`. Setar `setImageFileName(file.name)` no handler de upload e usar diretamente no `customData`.

### 3. `.lovable/plan.md` com conteúdo obsoleto

Contém o resultado do teste anterior (accordion fix). Não é código de produção, mas é ruído.

**Ação:** Limpar o conteúdo do plan.md.

---

### Arquivos Modificados

| Arquivo | Mudança |
|---|---|
| `src/components/ControlPanel.tsx` | Remover `forwardRef`, `displayName`, simplificar para função normal |
| `src/components/PhonePreview.tsx` | Remover `forwardRef`, `displayName`, simplificar para função normal |
| `src/pages/Customize.tsx` | Trocar `imageFile: File` por `imageFileName: string` |
| `.lovable/plan.md` | Limpar conteúdo obsoleto |

Todas são mudanças seguras sem impacto funcional.

