

## Comparar com original e reverter filtro

Quando o usuário aplica um filtro IA, adicionar duas funcionalidades:

### 1. Botão "Segurar para comparar" (press-and-hold)

Um botão que aparece **somente quando há um filtro ativo** (`activeFilterId !== null`). Enquanto o usuário **pressiona e segura**, o `PhonePreview` mostra a `originalImage`. Ao soltar, volta para a imagem filtrada.

- Ícone: `Eye` do lucide-react
- Posição: na barra de filtros (`AiFiltersList`), ao lado do texto de custo
- Implementação: `onPointerDown` → `setImage(originalImage)`, `onPointerUp/onPointerLeave` → `setImage(filteredImage)`

### 2. Botão "Remover filtro" (já existe parcialmente)

Clicar no filtro ativo já reverte para o original (linha existente em `handleFilterClick`). Mas isso não é óbvio. Vamos adicionar um **botão explícito "Remover filtro"** com ícone `X` que aparece quando `activeFilterId !== null`.

### Mudanças por arquivo

| Arquivo | Mudança |
|---------|---------|
| `Customize.tsx` | Novo state `previewImage` para alternar entre original/filtrado no hold; funções `handleCompareStart`/`handleCompareEnd` |
| `AiFiltersList.tsx` | Botão "Comparar" (press-hold) + botão "Remover" quando filtro ativo |
| `ImageControls.tsx` | Passar props `onCompareStart`, `onCompareEnd`, `onRemoveFilter`, `hasActiveFilter` |

### UX

Quando filtro IA ativo:
```
[👁 Segurar p/ comparar]  [✕ Remover filtro]
```

O hold funciona tanto em touch (mobile) quanto mouse (desktop) via `onPointerDown`/`onPointerUp`.

