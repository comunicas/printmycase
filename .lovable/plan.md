

## Adicionar link para Coleções na navegação e Landing Page

### Alterações

| Arquivo | O que muda |
|---|---|
| `src/components/AppHeader.tsx` | Adicionar botão "Coleções" ao lado de "Ver Modelos" na nav, com mesmo estilo e suporte a variante transparent |
| `src/pages/Landing.tsx` | Adicionar seção de Coleções entre "Modelos em Destaque" e "AI Coins", com preview das coleções ativas e CTA para `/colecoes`. Também adicionar link no footer |

### Detalhes

**AppHeader** — novo botão antes de "Ver Modelos":
```
Coleções | Ver Modelos | [coins] | [user]
```
Ambos com `variant="ghost"`, `size="sm"`, mesmas classes para transparência.

**Landing Page** — nova seção após "Modelos em Destaque":
- Título "Coleções Exclusivas"
- Usa `useCollections` (já existe) para buscar coleções ativas
- Grid 1-3 colunas com cards mostrando `cover_image` e nome
- Botão "Ver Todas as Coleções" linkando para `/colecoes`
- Envolvido em `ScrollReveal` como as demais seções

**Footer** — adicionar link "Coleções" na lista de links úteis.

