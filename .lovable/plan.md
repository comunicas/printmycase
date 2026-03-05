

## Plano: Testar FAQ, Refinar CTA + Form de Lead, Aprimorar Footer

### 1. Testar animação do FAQ accordion
Usar browser automation para abrir a landing, rolar até o FAQ e clicar nas perguntas para verificar a suavidade da animação.

### 2. Criar tabela `model_requests` no banco

```sql
CREATE TABLE public.model_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone text NOT NULL,
  model_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.model_requests ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode inserir (lead público)
CREATE POLICY "Anyone can submit model request"
  ON public.model_requests FOR INSERT
  WITH CHECK (true);

-- Admins podem ver todas as solicitações
CREATE POLICY "Admins can view model requests"
  ON public.model_requests FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
```

### 3. Criar página `/solicitar-modelo`

Nova página `src/pages/RequestModel.tsx` com formulário simples:
- Campo: telefone (com máscara)
- Campo: modelo do celular desejado
- Botão de envio
- Feedback de sucesso com toast
- Layout limpo com `AppHeader` + card centralizado

### 4. Refinar seção CTA Final

Na seção "Pronto para criar sua Case única?":
- Manter botão "Comece Agora" → `/catalog`
- Adicionar segundo botão "Solicitar Modelo" → `/solicitar-modelo` (outline/ghost)
- Texto ajustado para incluir a opção de solicitar modelo não disponível

### 5. Aprimorar Footer

Transformar o footer atual (minimalista) em um footer mais completo:
- 3 colunas: Marca/descrição | Links úteis | Contato/Redes
- Links: Catálogo, Solicitar Modelo, FAQ (âncora)
- Linha inferior com copyright + "Feito com ❤️"
- Estilo consistente com o tema dark/muted

### Arquivos afetados

| Arquivo | Ação |
|---|---|
| Migração SQL | Criar tabela `model_requests` + RLS |
| `src/pages/RequestModel.tsx` | Novo — formulário de lead |
| `src/pages/Landing.tsx` | Refinar CTA + aprimorar footer |
| `src/App.tsx` | Adicionar rota `/solicitar-modelo` |

