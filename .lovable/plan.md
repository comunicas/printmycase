

## Adicionar preconnect para Clarity + Verificar Code Splitting

### Situação Atual

- **Code splitting já está implementado** — todas as rotas exceto Landing já usam `React.lazy()` (linhas 12-36 do App.tsx). O bundle principal já está otimizado.
- **Clarity** já tem `dns-prefetch` (linha 33 do index.html) mas falta o `preconnect` completo.

### Mudança Necessária

**Arquivo: `index.html`** — 1 linha adicionada

Adicionar `<link rel="preconnect" href="https://scripts.clarity.ms" />` antes do `dns-prefetch` existente na linha 33. Isso estabelece a conexão TCP+TLS antecipadamente, economizando ~50-100ms no carregamento do script do Clarity.

### Resultado
- 1 arquivo, 1 linha adicionada
- Conexão com Clarity estabelecida mais cedo
- Code splitting já está em vigor — nenhuma mudança necessária no App.tsx

