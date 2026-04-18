
## Defer Meta Pixel

Atualmente o `fbevents.js` carrega imediatamente no `<head>` do `index.html`, bloqueando recursos críticos e adicionando 36KB de JS não usado no carregamento inicial.

### Mudança

Modificar o snippet do Meta Pixel em `index.html` para adiar o carregamento do `fbevents.js` até:
1. Evento `load` da janela (após FCP/LCP), OU
2. Primeira interação do usuário (`scroll`, `mousemove`, `touchstart`, `keydown`) — o que vier primeiro.

A fila `fbq()` continua disponível imediatamente (stub padrão), então qualquer chamada `fbq('track', ...)` feita antes do script carregar será enfileirada e processada normalmente após o load. Zero perda de eventos.

O `fbq('init', ...)` e `fbq('track', 'PageView')` permanecem na fila — disparam assim que o script real carrega.

### Implementação (index.html)

Substituir o bloco atual por uma versão que:
- Define `window.fbq` stub imediatamente (preserva enfileiramento)
- Injeta o `<script src="...fbevents.js">` apenas após `load` ou primeira interação
- Usa `{ once: true, passive: true }` nos listeners

### Considerações
- **CAPI server-side**: continua funcionando normalmente (independente do pixel client).
- **PageView**: enfileirado, dispara ~1-3s após load. Não compromete tracking pois o usuário ainda está na página.
- **Deduplicação**: o `event_id` compartilhado pixel↔CAPI continua funcionando (queue preserva a chamada).
- **`<noscript>` fallback**: mantido inalterado.

### Arquivo
- `index.html` — apenas o bloco `<script>` do Meta Pixel (~10 linhas).

### Impacto esperado
- ~36KB economizados no carregamento inicial
- Melhoria em FCP/LCP/TBT
- Zero impacto funcional no tracking
