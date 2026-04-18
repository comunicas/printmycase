
## Verificar grid mosaico + nomes de filtro limpos em produção

### Plano

1. `navigate_to_url` → `https://studio.printmycase.com.br/`
2. Scroll até a seção "Transforme qualquer foto em arte com IA"
3. `screenshot` para confirmar:
   - Grid mosaico Pinterest-style visível (não fallback)
   - Badges com nomes curtos e limpos (ex.: "Colorido", "Wallpaper", "Pop Art")
   - Sem strings tipo "Reorganize the provided image..." ou "Crie uma imagem com base na orignal..."
4. `list_network_requests` filtrando `public_ai_generations` para confirmar:
   - Status 200
   - Payload com `filter_name` populado pelo JOIN com `ai_filters.name`

### Critérios de sucesso

- Visual: grid mosaico + badges com nomes curados
- Network: query 200 com `filter_name` limpo
- Sem prompts brutos vazando na UI

### Se nomes ainda aparecem como prompt bruto

- Pode ser cache CDN da PostgREST → forçar reload com cache busting
- Verificar se `filter_id` está populado em `user_ai_generations` (LEFT JOIN retorna NULL se não houver match) → nesse caso, fallback de UI ou backfill de `filter_id` necessário
