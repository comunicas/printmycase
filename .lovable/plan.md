

## Executar Edge Function de Otimização de Imagens

### Problema

A edge function `optimize-existing-images` requer autenticação de um usuário admin (verifica `user_roles`). Não é possível executá-la diretamente via ferramenta de curl sem um token de sessão admin válido.

### Solução recomendada

Adicionar um botão no painel admin que chama a função com o token do usuário logado, já que o admin estará autenticado.

### Implementação

**1. Arquivo: `src/pages/Admin.tsx`**

Adicionar um botão "Otimizar Imagens" na área do admin que:
- Chama `supabase.functions.invoke("optimize-existing-images")` (o SDK injeta o token automaticamente)
- Mostra loading durante a execução
- Exibe toast com resultado (quantas imagens otimizadas / erros)

### Resultado

- Um clique no painel admin para otimizar todas as imagens pesadas existentes
- Feedback visual do progresso e resultado

