

## Admin de Mensagens de Contato + Honeypot Anti-Bot

### 1. Novo componente `src/components/admin/ContactMessagesManager.tsx`

Tabela read-only com as mensagens recebidas:
- Colunas: Nome, Email, Mensagem (truncada), Data
- Paginação de 10 itens
- Botão para expandir mensagem completa (dialog simples)
- Botão de deletar mensagem (com confirmação)
- Segue o padrão visual dos outros managers (Table, ConfirmDialog)

### 2. Registrar seção no Admin

- **`AdminSidebar.tsx`**: Adicionar `"contact-messages"` ao tipo `AdminSection` e ao grupo "Conteúdo" com ícone `Mail`
- **`Admin.tsx`**: Importar `ContactMessagesManager` e adicionar ao `sectionMap`

### 3. Migration: permitir admin deletar mensagens

```sql
CREATE POLICY "Admins can delete contact messages"
ON public.contact_messages FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
```

### 4. Honeypot no formulário de contato (`src/pages/Contact.tsx`)

- Adicionar campo hidden `website` (input invisível via CSS `absolute opacity-0 pointer-events-none`)
- Se preenchido, simular sucesso sem inserir no banco (bots preenchem tudo)
- Zero fricção para usuários reais

### Detalhes técnicos
- O honeypot usa posicionamento absoluto + opacidade 0 + tabindex -1 para ser invisível a humanos
- Nenhuma dependência externa necessária

