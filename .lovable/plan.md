

## Aba "Solicitações" no Painel Admin

### Visao Geral

Criar um novo componente `ModelRequestsManager` e adicioná-lo como 4a aba no painel admin. Exibe as solicitações da tabela `model_requests` com opções de visualização e exclusão.

### Alterações

#### 1. `src/components/admin/ModelRequestsManager.tsx` (novo)

- Busca todas as linhas de `model_requests` ordenadas por `created_at desc`
- Exibe em cards ou tabela: telefone, modelo solicitado, data
- Botão de excluir por solicitação (com confirmação)
- Estado vazio quando não há solicitações
- Badge com contagem total no topo

#### 2. `src/pages/Admin.tsx`

- Importar `ModelRequestsManager`
- Adicionar aba "Solicitações" com ícone `Smartphone` na `TabsList`
- Adicionar `TabsContent` renderizando `<ModelRequestsManager />`

### Nenhuma alteração de banco necessária

A tabela `model_requests` já existe com RLS configurado: admins podem ler e deletar.

### Arquivos afetados

| Arquivo | Ação |
|---|---|
| `src/components/admin/ModelRequestsManager.tsx` | Novo |
| `src/pages/Admin.tsx` | Adicionar aba |

