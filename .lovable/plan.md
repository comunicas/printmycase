

## Diagnóstico e Otimizações

### 1. Cron Job — Ainda sem logs

O `cleanup-pending-checkouts` **não tem logs registrados**, o que significa que o cron ainda não disparou (foi configurado há menos de 1 hora). O cron está agendado para rodar no minuto 0 de cada hora. Será necessário verificar novamente após a próxima hora cheia.

**Ação**: Nenhuma alteração de código. Verificarei os logs novamente quando solicitado.

### 2. Logs Fal.ai — Problemas identificados

O log mostra erro `image_too_small` (mín. 256×256px) ao usar o filtro `lighting-restoration`. O sistema já trata esse erro no frontend com toast + sugestão de upscale, mas o payload está enviando a imagem completa em base64 como string nos logs, o que **polui os logs e gasta memória desnecessariamente**.

### 3. Otimizações propostas

#### A. Loading UX melhorado — Progresso com etapas
Substituir o spinner genérico "Processando..." por mensagens contextuais com etapas visíveis:
- Filtro IA: "Enviando imagem..." → "Aplicando filtro IA..." → "Finalizando..."
- Upscale: "Enviando imagem..." → "Melhorando resolução..." → "Finalizando..."

Isso dá feedback mais claro ao usuário durante os 5-15s de espera.

#### B. Reduzir payload antes de enviar ao Fal.ai
A imagem comprimida no frontend já tem `maxW=1200, maxH=2400`, mas para filtros IA isso é mais do que necessário (o output é 720×1280). Comprimir para **800×1600** antes de enviar ao filtro reduziria o tamanho do base64 em ~40%, diminuindo tempo de upload e processamento.

#### C. Limpar logs — não logar base64
Remover o base64 dos `console.log` no edge function (já parcialmente feito, mas o log do `lighting-restoration` ainda envia `image_urls` com base64).

#### D. Streaming response — retornar URL em vez de base64
Em vez de baixar a imagem do Fal.ai, converter para base64 e retornar (dobra o tempo e memória), retornar diretamente a URL temporária do Fal.ai. O frontend faz o fetch da URL. Isso reduz o tempo de resposta da edge function em ~30-50%.

### Passos de implementação

1. **Edge function `apply-ai-filter`**: Retornar `{ imageUrl: outputUrl }` em vez de converter para base64. Remover a lógica de fetch+base64 do server. Sanitizar logs.

2. **Edge function `upscale-image`**: Mesmo padrão — retornar URL direta do Fal.ai.

3. **Frontend `Customize.tsx`**: Atualizar handlers de filtro e upscale para receber URL e usá-la diretamente (browsers carregam URLs externas nativamente). Adicionar fallback para base64 caso a URL expire.

4. **Frontend `PhonePreview.tsx`**: Adicionar mensagens de progresso contextuais via prop `processingMessage` em vez do genérico "Processando...".

5. **Frontend `image-utils.ts`**: Adicionar função `compressForAI()` com limites menores (800×1600) para reduzir payload enviado às edge functions.

### Detalhes técnicos

- URLs do Fal.ai expiram em ~1h, tempo suficiente para o fluxo de customização
- A compressão menor para IA não afeta qualidade final (Fal.ai processa em 720×1280 para filtros)
- O `renderSnapshot` continua usando a imagem em resolução original para o resultado final de impressão

