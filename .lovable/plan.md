
## Verificação E2E da Landing Page após limpeza de assets

### Plano

Usar browser automation para:
1. `navigate_to_sandbox` em `/` (viewport 1200x852, atual do usuário)
2. `screenshot` da landing inteira (scroll por seções)
3. `list_network_requests` filtrando por imagens — verificar 404s em `/lovable-uploads/*`
4. `read_console_logs` buscando erros de imagem
5. Scroll até a seção AI Showcase e screenshot
6. Testar viewport mobile (390x844) para confirmar marquee fallback (caso seja exibido)

### Critérios de sucesso

- Zero requests com status 404 para `/lovable-uploads/*`
- Zero erros de console relacionados a imagens
- Seção AI Showcase renderiza (com gerações públicas OU com fallback marquee)
- Logo, Stripe badges, e demais imagens visíveis

### Arquivos potencialmente afetados (a verificar)

- `AiCoinsSection` — usa `ai-showcase-[1-5]-sm.webp` (mantidos) ✅
- `PaymentBadges` — usa `stripe-logo-sm.webp` (mantido) ✅
- `AppHeader` / Logo — usa `/logo-printmycase-sm.webp` (raiz, não afetado) ✅
- `Unsubscribe` — usa bucket Supabase (não afetado) ✅

### Se encontrar quebras

Reportar imediatamente quais imagens falharam e propor correção (restaurar do git ou ajustar referência).
