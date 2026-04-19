
## Remover coleção legada "Design"

A coleção `design` (slug: `design`) está vazia — 0 designs ativos atribuídos. Detectada na auditoria anterior como legado.

### Verificação
Confirmar via query antes de remover (zero designs, mesmo inativos).

### Ação
- `DELETE FROM collections WHERE slug = 'design'` via insert tool
- Sem migração de schema necessária
- Sem código a alterar (hook `useCollections` filtra por `active=true` e já se adapta)

### Risco
Nulo. Coleção sem dados associados, sem rotas hardcoded apontando para `/colecao/design`.

### Arquivos
Nenhum arquivo de código modificado. Apenas operação de dados.
