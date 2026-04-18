
## Verificar grid mosaico em produção

### Plano

1. `navigate_to_url` para `https://studio.printmycase.com.br/` (produção, domínio custom)
2. Scroll até a seção "Transforme qualquer foto em arte com IA"
3. `screenshot` para confirmar visualmente: grid mosaico (colunas variáveis com aspect ratios mistos) em vez do carrossel marquee horizontal
4. `list_network_requests` filtrando por `public_ai_generations` para confirmar status 200 e payload com 8 itens
5. Repetir em viewport mobile (390x844) para validar responsividade do grid (2 colunas no mobile, 4 no desktop)

### Critérios de sucesso

- Visual: grid mosaico Pinterest-style visível (não o carrossel deslizante)
- Network: request a `public_ai_generations` retorna array com ≥1 item
- Console: zero erros relacionados à query

### Se ainda mostrar fallback

- Checar se a migração foi aplicada em produção (pode haver lag de deploy)
- Verificar se há cache CDN segurando resposta antiga da PostgREST
- Confirmar via `supabase--read_query` rodando como `anon` se a permissão GRANT realmente funcionou
