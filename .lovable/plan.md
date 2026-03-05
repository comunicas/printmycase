

## Seção FAQ com Gerenciamento pelo Admin

### Visão Geral

O FAQ será dinâmico: armazenado no banco de dados e editável pelo painel admin. A landing page busca as perguntas publicadas em tempo real.

### Etapas

#### 1. Criar tabela `faqs` no banco de dados

```sql
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ler FAQs ativos
CREATE POLICY "Anyone can view active faqs"
  ON public.faqs FOR SELECT
  USING (active = true);

-- Admins podem tudo
CREATE POLICY "Admins can manage faqs"
  ON public.faqs FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Trigger updated_at
CREATE TRIGGER set_faqs_updated_at
  BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
```

#### 2. Inserir perguntas iniciais via seed

6 perguntas pré-definidas (PrintMyCase, Micro Piezo, material da case, durabilidade, imagem personalizada, prazo) inseridas com `sort_order` de 1 a 6.

#### 3. Criar componente `FaqSection.tsx`

- Busca FAQs ativos ordenados por `sort_order` via Supabase
- Accordion com `@radix-ui/react-accordion`
- Fundo `bg-muted/30`, título centralizado, `ScrollReveal`
- Inserido em `Landing.tsx` entre depoimentos e CTA final

#### 4. Aba "FAQ" no painel Admin

Adicionar uma terceira aba no `Admin.tsx`:

- Listagem das perguntas com drag-to-reorder (ou botões sobe/desce para simplicidade)
- Botao "Nova Pergunta" abre dialog com campos: pergunta, resposta, ativo (toggle)
- Edição inline ou via dialog
- Toggle ativo/inativo por pergunta
- Botão excluir com confirmação

### Dependência de pacote

- Instalar `@radix-ui/react-accordion`

### Arquivos afetados

| Arquivo | Ação |
|---|---|
| Migração SQL | Criar tabela `faqs` + RLS + seed |
| `src/components/FaqSection.tsx` | Novo — accordion público |
| `src/components/admin/FaqManager.tsx` | Novo — CRUD de FAQs |
| `src/pages/Landing.tsx` | Importar `FaqSection` |
| `src/pages/Admin.tsx` | Adicionar aba "FAQ" com `FaqManager` |

