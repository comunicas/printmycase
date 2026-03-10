

## Inserir Categorias e Artigos na Base de Conhecimento

Vou inserir dados reais nas tabelas `kb_categories` e `kb_articles` usando as informações extraídas dos documentos legais, FAQs existentes, configurações de moedas e funcionalidades reais da plataforma. Nenhuma informação será inventada.

### Categorias a criar (5)

| # | Nome | Slug | Ícone | Descrição |
|---|---|---|---|---|
| 1 | Pedidos e Envio | pedidos-envio | Package | Prazos, rastreamento, frete e entrega |
| 2 | Personalização e IA | personalizacao-ia | Sparkles | Filtros artísticos, ArtisCoins e upload de imagens |
| 3 | Pagamentos | pagamentos | CreditCard | Meios de pagamento, segurança e reembolso |
| 4 | Conta e Perfil | conta-perfil | UserCircle | Cadastro, indicações e gerenciamento de conta |
| 5 | Produto e Qualidade | produto-qualidade | Shield | Material, impressão, garantia e tecnologia |

### Artigos por categoria (baseados em dados reais)

**Pedidos e Envio** (5 artigos):
1. Como acompanhar meu pedido — status reais do sistema (Pendente → Entregue)
2. Quais os prazos de produção e entrega — 48h produção, frete por região (Sudeste R$12,90)
3. Para quais regiões vocês entregam — atualmente Sudeste
4. Posso cancelar meu pedido — antes da produção, conforme política
5. O que fazer se meu pedido chegou com defeito — procedimento via sac@artiscase.com

**Personalização e IA** (4 artigos):
1. Como personalizar minha case — fluxo: catálogo → upload → ajustes → checkout
2. Como funcionam os filtros de IA — custo de 15 ArtisCoins por filtro, estilos disponíveis
3. O que são ArtisCoins — moeda virtual, bônus de cadastro (50 moedas), pacotes de compra
4. Qual a resolução recomendada para imagens — acima de 1000x1000px, upscale disponível (20 coins)

**Pagamentos** (3 artigos):
1. Quais formas de pagamento aceitas — Visa, Mastercard, Elo, Amex, Pix via Stripe
2. O pagamento é seguro — processado via Stripe, dados não armazenados
3. Como funciona o reembolso — até 10 dias úteis, mesmo meio de pagamento

**Conta e Perfil** (3 artigos):
1. Como criar minha conta — cadastro com email ou Google, bônus de 50 ArtisCoins
2. Como funciona o programa de indicação — código de indicação, 50 moedas por indicação
3. Como alterar meus dados ou excluir minha conta — perfil editável, exclusão via configurações

**Produto e Qualidade** (4 artigos):
1. De que material é feita a case — policarbonato rígido + TPU flexível, soft-touch
2. Qual a qualidade da impressão — Epson Micro Piezo, impressão UV direta no policarbonato
3. A impressão desbota com o tempo — tinta UV resistente a raios solares
4. O que é a tecnologia PrintMyCase — processo de impressão direta, presente em +10 shoppings

### Implementação

- Usar o insert tool para inserir as 5 categorias e os 19 artigos
- Marcar as FAQs existentes mais relevantes como `featured = true` para aparecerem na landing
- Todo conteúdo em Markdown, baseado exclusivamente nos documentos legais, configurações e código real da aplicação

