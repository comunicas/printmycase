
## Estado atual — Customização

Refatoração concluída. Sem pendências.

### Últimas implementações
- Long-press preview: mostra `style_image_url` como overlay no PhonePreview (300ms)
- Download via blob para URLs cross-origin (fal.ai)
- Persistência de `filteredImage` no storage + restore via `customization_data`
- Timeout alinhado em 120s para apply-ai-filter e upscale-image
- Remoção de `preview_css` do tipo AiFilter e do select de filtros
