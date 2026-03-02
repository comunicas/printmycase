

# Revisao Completa do Fluxo de Compra e CRUD do Usuario

Apos analisar todo o codigo do projeto, identifiquei **bugs reais, problemas de seguranca e codigo legado** que precisam ser corrigidos.

---

## Problemas Encontrados

### 1. Storage sem politicas de acesso (BUG CRITICO)
O bucket `customizations` e privado mas nao tem politicas de storage configuradas. Isso significa que o upload de imagem na pagina de customizacao **falha silenciosamente** ou retorna erro de permissao. O usuario nao consegue fazer upload da imagem da capa.

### 2. Pagina de pedidos mostra ID tecnico em vez do nome do produto
Em `Orders.tsx`, a coluna exibida e `order.product_id` (ex: "iphone-17-air") em vez do nome legivel como "Capa iPhone 17 Air".

### 3. useAuth tem race condition
O hook `useAuth` chama `onAuthStateChange` e `getSession` em paralelo, ambos setando `loading = false`. Alem disso, faz chamadas async dentro do callback `onAuthStateChange`, o que a documentacao do SDK desaconselha pois pode causar deadlocks.

### 4. Rascunho (Draft) salva imagem base64 no localStorage (legado)
O `handleSaveDraft` em `Customize.tsx` salva a imagem inteira em base64 no localStorage (pode ter megabytes). Alem disso, o rascunho nunca e carregado de volta - e codigo morto.

### 5. Customize nao valida se o produto existe
Se o usuario acessar `/customize/produto-invalido`, a pagina renderiza com dados undefined sem mostrar erro.

### 6. RLS policy "Service role can update orders" e RESTRICTIVE
A policy esta marcada como RESTRICTIVE (nao permissiva), mas o service role ja ignora RLS. Essa policy e inutil e pode causar confusao.

### 7. Coluna `stripe_subscription_id` na tabela orders (legado)
Nao e usada em nenhum lugar do codigo. E residuo de uma implementacao anterior.

---

## Plano de Correcoes

### Correcao 1: Criar politicas de storage para o bucket `customizations`
- Migrar: adicionar politicas que permitam usuarios autenticados fazer upload em `{user_id}/*` e ler seus proprios arquivos.

### Correcao 2: Exibir nome do produto na listagem de pedidos
- Em `Orders.tsx`, usar `getProduct(order.product_id)` para mostrar o nome legivel em vez do ID tecnico.

### Correcao 3: Corrigir race condition no useAuth
- Remover fetch de profile de dentro do `onAuthStateChange` callback
- Usar um `useEffect` separado que reage a mudancas do `user` para buscar o profile
- Garantir que `loading` so e setado `false` uma vez

### Correcao 4: Remover salvamento de rascunho (codigo morto)
- Remover `handleSaveDraft` e o botao "Salvar Rascunho" de `Customize.tsx`, ja que o rascunho nunca e restaurado.

### Correcao 5: Validar produto na pagina de customizacao
- Adicionar verificacao de produto invalido com redirecionamento para o catalogo e mensagem de erro.

### Correcao 6: Remover coluna legada `stripe_subscription_id`
- Migrar: remover a coluna `stripe_subscription_id` da tabela orders.

---

## Detalhes Tecnicos

### Storage Policies (SQL)
```text
-- Permitir upload autenticado na pasta do usuario
CREATE POLICY "Users can upload own customizations"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'customizations' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Permitir leitura dos proprios arquivos
CREATE POLICY "Users can read own customizations"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'customizations' AND (storage.foldername(name))[1] = auth.uid()::text);
```

### useAuth refatorado
- `onAuthStateChange`: apenas seta `user` e `loading`
- `useEffect([user])`: busca profile quando user muda
- Remove chamada duplicada de `getSession` (onAuthStateChange ja cobre o estado inicial)

### Arquivos modificados
| Arquivo | Alteracao |
|---|---|
| `src/hooks/useAuth.ts` | Corrigir race condition, separar fetch de profile |
| `src/pages/Orders.tsx` | Mostrar nome do produto em vez de ID |
| `src/pages/Customize.tsx` | Remover draft, validar produto |
| Migration SQL | Storage policies + remover coluna legada |

