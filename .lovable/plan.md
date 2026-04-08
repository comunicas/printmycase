

## Criar página de Contato e atualizar footer

### O que será feito

**1. Nova página `src/pages/Contact.tsx`**
- Formulário simples e minimalista: Nome, Email, Mensagem
- Envia os dados para uma tabela `contact_messages` no banco
- Feedback visual de sucesso após envio
- Usa os mesmos componentes de form já existentes (`FormCard`, `SubmitButton`, `form-field`)
- Inclui `AppHeader` e layout consistente com o resto do site

**2. Migration: tabela `contact_messages`**
```sql
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  message text NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Only admins can read" ON public.contact_messages FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
```

**3. Rota em `src/App.tsx`**
- Adicionar `/contato` apontando para a nova página

**4. Atualizar footer em `src/pages/Landing.tsx`**
- Substituir o email `sac@printmycase.com.br` por um `<Link to="/contato">` com texto "Fale Conosco"

**5. (Opcional) Admin — visualizar mensagens**
- Pode ser adicionado depois se quiser ver as mensagens recebidas no painel admin

### Resultado
No footer, a seção Contato mostrará um link "Fale Conosco" que leva a um formulário limpo, sem expor o email diretamente na página.

