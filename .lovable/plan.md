

## Recuperar Checkout Abandonado com Opção de Editar

### Visão Geral
Persistir customizações no banco de dados quando o usuário avança para o checkout. Se ele sair sem finalizar, poderá retomar o pagamento OU voltar a editar a customização, tudo a partir da página de Pedidos.

### 1. Nova tabela `pending_checkouts`

```sql
CREATE TABLE public.pending_checkouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id text NOT NULL,
  customization_data jsonb NOT NULL,
  original_image_path text,
  edited_image_path text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);

ALTER TABLE public.pending_checkouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pending" ON public.pending_checkouts
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own pending" ON public.pending_checkouts
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own pending" ON public.pending_checkouts
  FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own pending" ON public.pending_checkouts
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER set_updated_at BEFORE UPDATE ON public.pending_checkouts
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

### 2. `Customize.tsx` — Salvar rascunho no banco ao clicar "Continuar"

Na função `handleContinue`, após gerar o snapshot e salvar no `sessionStorage`, fazer upload das imagens para o bucket `customizations` e upsert em `pending_checkouts`:

- Upload da imagem original e editada para `customizations/{user_id}/`
- Upsert em `pending_checkouts` com `(user_id, product_id)` contendo paths e dados de customização (scale, position, rotation, activeFilter)
- Manter `sessionStorage` como mecanismo primário (rápido); banco como backup persistente

### 3. `Checkout.tsx` — Recuperar do banco se `sessionStorage` vazio

Se `sessionStorage.getItem("customization")` retorna null:
- Buscar `pending_checkouts` pelo `user_id` + `product_id` (via slug → id lookup)
- Baixar imagens do storage via `getPublicUrl` ou `createSignedUrl`
- Restaurar o state e permitir continuar normalmente
- Ao finalizar pagamento com sucesso, deletar o `pending_checkout`

### 4. `Checkout.tsx` — Botão "Editar customização"

Adicionar um botão no mini preview (card com a imagem) que redireciona para `/customize/{slug}` preservando os dados:
- Ao clicar, salvar os dados atuais no `sessionStorage` como draft (`draft-customize-{slug}`) para que o `Customize.tsx` os restaure automaticamente via lógica de draft existente
- O fluxo existente de draft restore no `Customize.tsx` já cuida de recarregar a imagem, scale, position e rotation

### 5. `Customize.tsx` — Restaurar do banco se draft de session vazio

No bloco de "Draft restore", adicionar fallback: se não há draft no `sessionStorage`, buscar em `pending_checkouts`. Isso cobre o cenário em que o usuário fecha o navegador e volta dias depois:
- Baixar imagem do storage
- Restaurar scale, position, rotation do `customization_data`
- Toast "Rascunho recuperado"

### 6. `Orders.tsx` — Card de "Continuar pedido"

Antes da lista de pedidos, buscar `pending_checkouts` do usuário. Para cada um, exibir um card com:
- Imagem editada (thumbnail do storage)
- Nome do produto
- Dois botões: **"Editar"** (→ `/customize/{slug}`) e **"Continuar pagamento"** (→ `/checkout/{slug}`)
- Botão de descartar (delete do registro)

### 7. Edge function `create-checkout` — Limpar pending

Após inserir a order com sucesso, deletar o `pending_checkout` correspondente:
```ts
await supabaseAdmin
  .from("pending_checkouts")
  .delete()
  .eq("user_id", userId)
  .eq("product_id", product_id);
```

### Fluxo do Usuário

```text
Customizar → Continuar → Salva no banco + sessionStorage → Checkout
                                                            ├── Finaliza → deleta pending
                                                            ├── "Editar" → volta ao Customize (dados preservados)
                                                            └── Sai da página → volta depois:
                                                                 ├── Pedidos → "Continuar pedido" ou "Editar"
                                                                 └── /customize/{slug} → restaura do banco
```

