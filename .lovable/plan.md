

## Situacao atual

Os pacotes de moedas estao **hardcoded** em dois lugares:
- `src/pages/Coins.tsx` — array `PACKAGES` com coins, preco, label e badge
- `supabase/functions/create-coin-checkout/index.ts` — objeto `COIN_PACKAGES` com coins → preco em centavos

Nao existe nenhuma interface admin para editar pacotes. Para alterar precos ou quantidades, seria necessario editar codigo.

## Plano: Tornar pacotes editaveis via admin

**1. Migração SQL — Criar tabela `coin_packages`**
```sql
CREATE TABLE public.coin_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coins integer NOT NULL,
  price_cents integer NOT NULL,
  badge text, -- ex: "Mais popular", "Melhor valor"
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coin_packages ENABLE ROW LEVEL SECURITY;

-- Admins gerenciam
CREATE POLICY "Admins can manage coin packages"
  ON public.coin_packages FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Qualquer um pode ver pacotes ativos
CREATE POLICY "Anyone can view active coin packages"
  ON public.coin_packages FOR SELECT TO public
  USING (active = true);

-- Seed com os pacotes atuais
INSERT INTO public.coin_packages (coins, price_cents, badge, sort_order) VALUES
  (100, 990, NULL, 0),
  (500, 3990, 'Mais popular', 1),
  (1500, 9990, NULL, 2),
  (5000, 24990, 'Melhor valor', 3);
```

**2. `src/components/admin/CoinPackagesManager.tsx` — CRUD de pacotes**
- Listar pacotes com campos: moedas, preco (centavos), badge, ordem, ativo
- Adicionar/editar/excluir pacotes
- Integrar como sub-aba dentro da aba "Moedas" do admin

**3. `src/pages/Coins.tsx` — Carregar pacotes do banco**
- Substituir array `PACKAGES` hardcoded por query a `coin_packages` ordenada por `sort_order`
- Manter mesma lógica de calculo de desconto e renderizacao

**4. `supabase/functions/create-coin-checkout/index.ts` — Validar contra o banco**
- Substituir `COIN_PACKAGES` hardcoded por query a `coin_packages` para buscar `price_cents` pelo `coins` recebido
- Rejeitar se pacote nao existir ou estiver inativo

### Arquivos alterados
- Migracao SQL (nova tabela)
- `src/components/admin/CoinPackagesManager.tsx` (novo)
- `src/components/admin/CoinsManager.tsx` (adicionar sub-aba de pacotes)
- `src/pages/Coins.tsx` (query dinamica)
- `supabase/functions/create-coin-checkout/index.ts` (validacao dinamica)

