

## Adicionar FAQ sobre Trocas e Devoluções

### Situação atual
O artigo "Compra e Pagamento" (`12d6a17a`) já contém uma seção sobre trocas e devoluções no final do conteúdo. Porém, não existe um FAQ correspondente na tabela `faqs` — provavelmente foi perdido por truncamento na migração anterior.

### Plano

**Migração SQL** para inserir 1 novo FAQ:

| Campo | Valor |
|---|---|
| question | "E se minha case chegar com defeito?" |
| answer | "Por se tratar de um produto personalizado e fabricado sob demanda, trocas e devoluções são aceitas apenas em caso de defeito de fabricação. Nestes casos, entre em contato conosco com fotos do produto para análise e resolução." |
| kb_article_id | `12d6a17a-4d25-4644-aff8-a7330a59d772` (Compra e Pagamento) |
| active | true |
| featured | false |
| sort_order | próximo da sequência atual |

Sem alterações de código — apenas dados.

