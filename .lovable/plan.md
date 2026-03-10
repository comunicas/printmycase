

## Ajustar Categoria "Perguntas Frequentes" na Central de Ajuda

### Situação atual
A categoria "Perguntas Frequentes" (`132e18f2`) existe no KB mas tem **0 artigos**. A descrição atual é genérica: "Dúvidas mais comuns sobre nossos produtos e serviços".

Na home, os FAQs em destaque cobrem: material, impressão, tecnologia PrintMyCase, prazo, filtros IA, ArtisCoins e pagamentos.

### Plano

**1. Atualizar descrição da categoria** para refletir os 4 pilares: qualidade, impressão, compra e facilidade.

**2. Criar 4 artigos-guia** na categoria "Perguntas Frequentes", cada um consolidando as respostas da home num formato mais completo:

| Artigo | Conteúdo base (FAQs relacionados) |
|---|---|
| **Qualidade e Material** | Material policarbonato, durabilidade, resistência |
| **Impressão e Tecnologia** | Qualidade da impressão Epson, tecnologia PrintMyCase, desbotamento |
| **Compra e Pagamento** | Formas de pagamento, segurança, prazo de entrega |
| **Personalização Fácil** | Envio de imagem, filtros IA, ArtisCoins, resolução mínima |

**3. Vincular FAQs da home** aos novos artigos via `kb_article_id` nos registros que ainda não têm link.

### Implementação
- Migração SQL para inserir os 4 artigos na tabela `kb_articles` com conteúdo Markdown
- Migração SQL para atualizar `kb_article_id` nos FAQs sem vínculo
- Atualizar descrição da categoria "Perguntas Frequentes"
- Sem alterações de código

