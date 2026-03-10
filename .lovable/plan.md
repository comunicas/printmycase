

## Termos de Uso, Política de Privacidade e Integração no Site

### Visão geral

Criar uma tabela `legal_documents` para armazenar os documentos legais (Termos de Uso e Política de Privacidade) editáveis pelo admin, com conteúdo inicial gerado com base nas specs da ArtisCase. Adicionar páginas públicas para visualização, checkbox de aceite no Signup, links no footer e gerenciamento no Admin.

### 1. Banco de dados

Nova tabela `legal_documents`:

```sql
CREATE TABLE public.legal_documents (
  slug TEXT PRIMARY KEY,           -- 'terms' | 'privacy'
  title TEXT NOT NULL,
  content TEXT NOT NULL,            -- markdown
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode ler
CREATE POLICY "Anyone can read legal docs" ON public.legal_documents
  FOR SELECT TO public USING (true);

-- Admins podem editar
CREATE POLICY "Admins can manage legal docs" ON public.legal_documents
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));
```

Inserir conteúdo inicial via migration com os textos completos em português, cobrindo:

**Termos de Uso**: objeto da plataforma (venda de capas personalizadas), cadastro e conta, processo de personalização com IA (ArtisCoins), pagamento via Stripe/Pix, prazo de produção 48h, envio e frete, direitos de propriedade intelectual sobre imagens enviadas, limitação de responsabilidade, cancelamentos/trocas conforme CDC.

**Política de Privacidade**: dados coletados (nome, email, telefone, endereço, fotos enviadas), uso de cookies e Microsoft Clarity para analytics, armazenamento seguro, compartilhamento com Stripe para pagamentos, direitos do titular (LGPD), retenção de dados, contato.

### 2. Novas páginas

**`src/pages/Terms.tsx`** e **`src/pages/Privacy.tsx`**
- Buscam da tabela `legal_documents` pelo slug (`terms` / `privacy`)
- Renderizam o conteúdo markdown como texto formatado (usando classes Tailwind prose ou renderização simples com `whitespace-pre-wrap`)
- Layout com AppHeader + conteúdo centralizado

### 3. Rotas

Em `App.tsx`, adicionar:
- `/termos` → `<Terms />`
- `/privacidade` → `<Privacy />`

### 4. Admin — LegalDocsManager

**`src/components/admin/LegalDocsManager.tsx`**
- Lista os 2 documentos com botão "Editar"
- Dialog com textarea grande para editar o conteúdo markdown
- Salva via `supabase.from("legal_documents").update()`

**`src/pages/Admin.tsx`**
- Nova tab "Legal" com ícone `FileText`

### 5. Checkbox no Signup

Em `src/pages/Signup.tsx`:
- Adicionar checkbox antes do botão "Criar conta":
  `"Li e aceito os Termos de Uso e a Política de Privacidade"` com links para `/termos` e `/privacidade`
- Desabilitar submit se não marcado

### 6. Footer

Em `src/pages/Landing.tsx`, na seção "Links Úteis":
- Adicionar links para `/termos` (Termos de Uso) e `/privacidade` (Política de Privacidade)

### Arquivos alterados/criados
- Migration SQL (tabela + seed dos documentos)
- `src/pages/Terms.tsx` (novo)
- `src/pages/Privacy.tsx` (novo)
- `src/components/admin/LegalDocsManager.tsx` (novo)
- `src/pages/Admin.tsx` — nova tab
- `src/pages/Signup.tsx` — checkbox de aceite
- `src/pages/Landing.tsx` — links no footer
- `src/App.tsx` — rotas novas

