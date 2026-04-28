## Diagnóstico

A tabela `user_ai_generations` possui as RLS corretas:

- **PERMISSIVE SELECT (anon+auth)**: `public = true` → galeria pública.
- **PERMISSIVE SELECT (auth)**: `user_id = auth.uid()` → próprias gerações.
- **PERMISSIVE ALL (auth)**: admin.

Como múltiplas policies PERMISSIVE são combinadas com **OR**, um usuário autenticado recebe automaticamente: (suas gerações) **OU** (qualquer geração marcada como `public=true` pelo admin). As RLS estão corretas.

**O bug está no front-end**, não no banco:

### Arquivo `src/pages/MyGenerations.tsx` (linhas 50-55)

```ts
const { data, error } = await supabase
  .from("user_ai_generations")
  .select("*")
  .order("created_at", { ascending: false })
  .limit(100);
```

A query **não filtra por `user_id`**. Como a policy de "públicas" devolve por OR todas as gerações marcadas como públicas pelo admin, o usuário logado vê na sua tela "Minhas Gerações" também as imagens públicas de outras pessoas misturadas. Por isso a sensação de "mostra tudo para todos".

### Home (`AiCoinsSection` + `AiGalleryModal`)

Consultam a view `public_ai_generations`, que já filtra `WHERE g.public = true` e expõe apenas colunas seguras (sem `user_id`, sem `storage_path`). A view já está correta — mostra apenas o que o admin liberou. Sem ação aqui, exceto uma pequena verificação defensiva.

## Correções

### 1. `src/pages/MyGenerations.tsx` — filtrar pelo usuário autenticado

Adicionar `.eq("user_id", user.id)` na query, garantindo que mesmo com a policy pública ativa só apareçam as gerações próprias do usuário logado:

```ts
const { data, error } = await supabase
  .from("user_ai_generations")
  .select("*")
  .eq("user_id", user.id)
  .order("created_at", { ascending: false })
  .limit(100);
```

Também adicionar guarda inicial `if (!user?.id) return;` antes da query.

### 2. Reforçar segurança no banco (defesa em profundidade)

Adicionar uma policy **RESTRICTIVE** na `user_ai_generations` que sempre exige uma das duas condições verdadeiras (próprio dono, admin, ou público), evitando qualquer brecha futura caso uma nova policy permissiva seja adicionada por engano:

```sql
CREATE POLICY "Restrict select to owner, admin or public"
ON public.user_ai_generations
AS RESTRICTIVE
FOR SELECT
TO anon, authenticated
USING (
  public = true
  OR user_id = auth.uid()
  OR has_role(auth.uid(), 'admin')
);
```

Isso não muda o comportamento atual (já permitido pelas PERMISSIVE), mas blinda o sistema contra regressões.

### 3. Verificação na home (sem alteração de código)

Confirmar via teste manual que a view `public_ai_generations` continua retornando apenas itens com `public=true` (já validado no `view_definition`).

## Arquivos afetados

- `src/pages/MyGenerations.tsx` — adicionar filtro `user_id` e guarda de usuário.
- Migration SQL — nova policy RESTRICTIVE em `user_ai_generations`.

## Resultado esperado

- **Home / galeria pública**: continua mostrando apenas o que o admin marcou como público (já correto).
- **Minhas Gerações**: passa a mostrar exclusivamente as imagens do próprio usuário logado.
- **Banco**: reforçado contra futuras policies permissivas indevidas.
