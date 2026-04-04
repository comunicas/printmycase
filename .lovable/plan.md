

## Gerenciamento de Lojas via Admin

### Visão geral
Criar uma tabela `stores` no banco de dados e um componente `StoresManager` no painel admin para incluir, editar e deletar lojas. O `StoreLocator` da landing passará a consumir dados do banco em vez de dados hardcoded.

### Fase 1 — Tabela `stores` (migration)

```sql
CREATE TABLE public.stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  state text NOT NULL,
  state_label text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage stores" ON public.stores
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active stores" ON public.stores
  FOR SELECT TO public
  USING (active = true);
```

Inserir as 11 lojas atuais como dados iniciais.

### Fase 2 — Admin: `StoresManager`

**Novo arquivo: `src/components/admin/StoresManager.tsx`**

Seguindo o padrão dos outros managers (ex: `CollectionsManager`):
- Tabela com colunas: Nome, Endereço, Estado, Lat/Lng, Ativo, Ações
- Dialog de criação/edição com campos: nome, endereço, estado, state_label, lat, lng, active, sort_order
- Botão de deletar com confirmação
- Toggle de ativo/inativo

**Arquivos editados:**
- `src/components/admin/AdminSidebar.tsx` — adicionar seção "stores" (ícone `MapPin`) no grupo "Catálogo" ou novo grupo "Presença"
- `src/pages/Admin.tsx` — importar e registrar `StoresManager` no `sectionMap`

### Fase 3 — `StoreLocator` dinâmico

**Arquivo editado: `src/components/StoreLocator.tsx`**
- Remover array hardcoded de lojas
- Buscar do banco: `supabase.from("stores").select("*").eq("active", true).order("sort_order")`
- Adaptar interface para usar `lat`/`lng` em vez de `position: [number, number]`
- Mostrar loading skeleton enquanto carrega
- Título dinâmico: `Presença real em {count} lojas ativas`

### Resultado
- Admin pode adicionar novas lojas com nome, endereço e coordenadas
- Admin pode editar qualquer campo de uma loja existente
- Admin pode desativar ou deletar lojas
- Landing page reflete mudanças automaticamente
- RLS garante que apenas admins podem gerenciar, público vê apenas lojas ativas

