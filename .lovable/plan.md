

## Importar 73 Produtos do CSV para o Banco

### Objetivo
Inserir/atualizar todos os 73 produtos do arquivo CSV de referência na tabela `products`, preservando todos os dados: id, slug, name, description, price_cents, stripe IDs, images, specs, colors, rating, review_count, active e device_image.

### Execução

**1. Script Python para parsing e upsert**
- Ler o CSV (separador `;`) com pandas
- Para cada linha, gerar um `INSERT ... ON CONFLICT (id) DO UPDATE` que atualiza todos os campos
- Tratar corretamente os campos JSONB (specs, colors) e array (images)
- Preservar valores nulos (device_image vazio = NULL)
- Executar via `psql`

### Dados preservados por produto
- IDs originais (uuid) e Stripe IDs
- Specs com material, peso, dimensões, compatibilidade, proteção, acabamento
- Colors (4 cores padrão)
- Rating e review_count
- Status active (true/false conforme CSV)
- device_image URLs do storage

### Resultado
- 73 produtos inseridos/atualizados no banco
- O ModelSelector na página de customização passará a listar todos os produtos ativos

