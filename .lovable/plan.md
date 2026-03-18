

## Análise: `ai_generated_images` é conteúdo exclusivo de admin

Ao investigar o código, a tabela `ai_generated_images` é usada **apenas por admins**:
- A edge function `generate-gallery-image` verifica `has_role(admin)` antes de inserir
- O componente `AiGenerationsManager` está dentro do painel admin
- Nenhum usuário comum gera ou visualiza essas imagens

Portanto, adicionar `user_id` por usuário não faz sentido neste caso. O problema real é a política RLS `"Anyone can view ai generated images" USING (true)` que expõe todas as gerações publicamente.

### Plano

**1. Migração SQL — Restringir SELECT para admins**
- Remover a política `"Anyone can view ai generated images"` (SELECT para public com `USING (true)`)
- A política existente `"Admins can manage ai generated images"` (ALL para authenticated) já cobre SELECT para admins

```sql
DROP POLICY "Anyone can view ai generated images" ON public.ai_generated_images;
```

Uma única migração. Nenhum código frontend precisa mudar — o `AiGenerationsManager` já roda autenticado como admin e a política ALL existente cobre o SELECT.

**2. Dismiss do finding de segurança**
- Marcar `PUBLIC_USER_GENERATED_CONTENT` como resolvido

### Arquivos alterados
- Nenhum arquivo de código — apenas migração SQL e dismiss do finding

