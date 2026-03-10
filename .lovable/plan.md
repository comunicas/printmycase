

## Plano: Reestruturar FAQ com categorias baseadas na jornada do usuário

### Situação atual
A FAQ possui 6 perguntas genéricas sem agrupamento. A tabela `faqs` não tem campo de categoria — todas as perguntas aparecem em uma lista linear.

### Proposta

Reorganizar a seção FAQ em **categorias temáticas** alinhadas à jornada do usuário e aos documentos legais da aplicação. O usuário verá abas (tabs) com os grupos, e dentro de cada aba o accordion já existente.

### Categorias propostas

```text
┌─────────────────┬──────────────────────────────────────────────────────────┐
│ Categoria       │ Perguntas sugeridas                                     │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Produto &       │ • De que material é feita a case?                       │
│ Qualidade       │ • Qual a qualidade da impressão?                        │
│                 │ • A impressão desbota com o tempo?                      │
│                 │ • O que é a tecnologia PrintMyCase?                     │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Personalização  │ • Posso enviar qualquer imagem?                         │
│ & IA            │ • Como funcionam os filtros de IA?                      │
│                 │ • O que são ArtisCoins?                                 │
│                 │ • A imagem precisa ter resolução mínima?                │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Pedido &        │ • Qual o prazo de produção e entrega?                   │
│ Entrega         │ • Como acompanho meu pedido?                           │
│                 │ • Para quais regiões vocês entregam?                    │
│                 │ • Posso alterar meu pedido após o pagamento?            │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Pagamento &     │ • Quais formas de pagamento são aceitas?                │
│ Segurança       │ • O pagamento é seguro?                                │
│                 │ • Posso parcelar?                                       │
├─────────────────┼──────────────────────────────────────────────────────────┤
│ Trocas &        │ • Posso trocar ou devolver?                             │
│ Políticas       │ • E se o produto chegar com defeito?                    │
│                 │ • Onde encontro os termos de uso?                       │
└─────────────────┴──────────────────────────────────────────────────────────┘
```

### Alterações técnicas

**1. Migração de banco de dados**
- Adicionar coluna `category TEXT NOT NULL DEFAULT 'geral'` na tabela `faqs`.
- Atualizar as 6 FAQs existentes com suas categorias corretas.

**2. Componente `FaqSection.tsx`**
- Buscar FAQs ativas com o campo `category`.
- Agrupar por categoria no frontend.
- Renderizar com `Tabs` (Radix) — uma aba por categoria — com o accordion dentro de cada aba.
- Em mobile, as tabs ficam com scroll horizontal.
- Manter o visual atual (cards `rounded-xl`, animações, ScrollReveal).

**3. Admin `FaqManager.tsx`**
- Adicionar campo `Categoria` no formulário de criação/edição (input de texto ou select com as categorias existentes).
- Exibir a categoria como badge/tag em cada item da lista.

**4. Conteúdo das FAQs**
- Inserir via migração SQL as novas perguntas sugeridas acima (além das 6 existentes), já categorizadas e com `sort_order` correto.

### Arquivos alterados
- `supabase/migrations/` — nova migração (add category + insert FAQs)
- `src/components/FaqSection.tsx` — tabs + agrupamento
- `src/components/admin/FaqManager.tsx` — campo categoria

