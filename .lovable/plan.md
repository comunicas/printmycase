

## Histórico de gerações IA do usuário

### O que será feito

Salvar automaticamente cada imagem gerada (filtro, upscale) numa tabela vinculada ao usuário, incluindo a imagem original e cada etapa. O usuário poderá consultar seu histórico e reutilizar imagens em novas customizações.

### 1. Nova tabela `user_ai_generations`

```sql
CREATE TABLE public.user_ai_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  image_url text NOT NULL,
  storage_path text NOT NULL,
  generation_type text NOT NULL DEFAULT 'filter', -- 'filter', 'upscale', 'original'
  filter_id uuid REFERENCES public.ai_filters(id) ON DELETE SET NULL,
  filter_name text,
  source_image_url text, -- imagem de entrada usada
  step_number integer NOT NULL DEFAULT 1,
  session_id text, -- agrupa gerações da mesma sessão de customização
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generations"
  ON public.user_ai_generations FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Service role can insert generations"
  ON public.user_ai_generations FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own generations"
  ON public.user_ai_generations FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all generations"
  ON public.user_ai_generations FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

### 2. Edge function `apply-ai-filter` — Salvar geração

Após upload do resultado para o storage e antes de retornar, inserir registro na `user_ai_generations`:
- `user_id`, `image_url` (signed URL), `storage_path`, `generation_type: 'filter'`, `filter_id`, `filter_name`, `source_image_url` (a URL de entrada), `step_number` (recebido do frontend)

Retornar também o `generation_id` na resposta.

### 3. Edge function `upscale-image` — Salvar geração

Mesma lógica: inserir com `generation_type: 'upscale'`.

### 4. Frontend — Salvar imagem original

No `useCustomize.tsx`, ao fazer o primeiro upload para AI (`uploadForAI`), salvar um registro com `generation_type: 'original'` via insert direto no Supabase client (o bucket já tem a imagem).

Gerar um `sessionId` (UUID) no início de cada sessão de customização para agrupar as gerações.

Enviar `step_number` e `session_id` no body do edge function para rastreamento.

### 5. Nova página `/minhas-geracoes`

- Rota protegida com `AuthGuard`
- Grid de cards com imagens agrupadas por `session_id` (data)
- Cada card mostra: thumbnail, tipo (filtro/upscale/original), nome do filtro, data
- Botão "Usar esta imagem" → navega para `/customize/:id` com a URL da imagem como parâmetro (query string `?source=`)
- Botão de excluir (deleta registro + arquivo do storage)

### 6. Integração no Customize

- Em `useCustomize.tsx`: aceitar query param `?source=` para carregar imagem do histórico como `originalImage`
- Link "Minhas gerações" acessível na tela de customização (botão no header ou área de controles)

### 7. Link no menu do usuário

Adicionar item "Minhas Gerações" no `UserMenu.tsx` apontando para `/minhas-geracoes`.

### Arquivos afetados

| Arquivo | Alteração |
|---------|-----------|
| Migração SQL | Criar tabela `user_ai_generations` + RLS |
| `supabase/functions/apply-ai-filter/index.ts` | Insert na tabela após salvar imagem |
| `supabase/functions/upscale-image/index.ts` | Insert na tabela após salvar imagem |
| `src/hooks/useCustomize.tsx` | `sessionId`, enviar `step_number`, aceitar `?source=` |
| `src/pages/MyGenerations.tsx` | Nova página com galeria do histórico |
| `src/App.tsx` | Rota `/minhas-geracoes` |
| `src/components/UserMenu.tsx` | Link "Minhas Gerações" |

