

## Coleções de Design — Estrutura Proposta

### Conceito

Fluxo atual: **Modelo (device)** → **Customizar (upload)** → **Checkout**
Novo fluxo: **Coleção** → **Escolher Design** → **Escolher Modelo** → **Checkout direto** (sem customização)

A arte já vem pronta — o cliente só escolhe para qual modelo de celular quer.

### Modelo de Dados

Duas novas tabelas:

```text
collections                          collection_designs
┌──────────────────────┐            ┌──────────────────────────┐
│ id (uuid PK)         │            │ id (uuid PK)             │
│ name                 │            │ collection_id (FK)       │
│ slug (unique)        │            │ name                     │
│ description          │            │ slug (unique)            │
│ cover_image          │            │ image_url (arte final)   │
│ active (bool)        │            │ price_cents (int)        │
│ sort_order (int)     │            │ active (bool)            │
│ created_at           │            │ sort_order (int)         │
│ updated_at           │            │ stripe_product_id        │
└──────────────────────┘            │ stripe_price_id          │
                                    │ created_at               │
                                    └──────────────────────────┘
```

Os **modelos compatíveis** vêm da tabela `products` existente (que já tem `device_image`). Na hora do checkout, o pedido registra: `design_id` + `product_id` (modelo escolhido). Sem necessidade de tabela de compatibilidade — todas as artes ficam disponíveis para todos os modelos ativos.

### Alterações no Checkout

- A tabela `orders` ganha uma coluna opcional `design_id uuid NULL` (FK para `collection_designs`)
- Quando `design_id` está preenchido, é uma compra de coleção (sem `customization_data`)
- A edge function `create-checkout` precisa aceitar `design_id` como alternativa a `customization_data`
- O nome no Stripe muda para `"Capa {design.name} - {product.name}"`

### Páginas Frontend

| Rota | Componente | Descrição |
|---|---|---|
| `/colecoes` | `Collections` | Lista de coleções ativas com cover image |
| `/colecao/:slug` | `CollectionPage` | Grid de designs da coleção |
| `/colecao/:collectionSlug/:designSlug` | `DesignPage` | Visualização da arte + seletor de modelo + botão comprar |

### Fluxo do Usuário

1. Acessa `/colecoes` — vê cards das coleções
2. Clica numa coleção — vê os designs disponíveis
3. Clica num design — vê a arte em destaque, preview no celular, dropdown/grid para escolher modelo
4. Seleciona modelo → vai direto para checkout (endereço + pagamento)

### Admin

- Novo tab "Coleções" no painel admin com CRUD de coleções e designs
- Upload de arte via bucket `product-assets` (pasta `collections/`)
- Sincronização Stripe para cada design (como já existe para products)

### RLS

- Collections e designs: leitura pública para `active = true`, gerenciamento restrito a admins (mesmo padrão das demais tabelas)
- Orders: sem alteração nas policies existentes

### Ordem de Implementação

1. Migração DB (tabelas + coluna `design_id` em orders)
2. Admin CRUD de coleções e designs
3. Páginas públicas (listagem, detalhe, seletor de modelo)
4. Adaptar `create-checkout` e `stripe-webhook` para pedidos de coleção
5. Adaptar OrdersManager e página de pedidos para exibir pedidos de coleção

