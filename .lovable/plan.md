
## Ajustar thresholds do FAB sticky em `/colecoes`

### Mudança

Em `src/pages/Collections.tsx`, no `useEffect` do scroll listener (linhas ~40-48):

```ts
const nearBottom = window.innerHeight + y >= document.body.scrollHeight - 600;
setShowFab(y > 400 && !nearBottom);
```

→

```ts
const nearBottom = window.innerHeight + y >= document.body.scrollHeight - 300;
setShowFab(y > 250 && !nearBottom);
```

### Resultado esperado
- FAB "Criar" passa a aparecer após 250px de scroll (antes 400px)
- Esconde apenas a 300px do rodapé (antes 600px) — funciona em catálogos curtos onde a página inteira tem ~1300px

### Arquivos
- `src/pages/Collections.tsx` — apenas 2 valores numéricos no listener de scroll

### Fora de escopo
Sem mudanças de layout, dados ou outros componentes.
