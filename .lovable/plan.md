
## Teste E2E — Sticky bar do checkout mobile (390px)

### Roteiro

1. `navigate_to_sandbox` → `/checkout/{id}` em 390×844
   - Preciso de um produto válido. Vou tentar via fluxo natural: navegar para `/customize/{slug}` (já estamos em `/colecao/creative/capa-personalizada-why-tho`), o que requer uma customização em sessionStorage. Como o checkout exige `customization` em sessionStorage **ou** um pending checkout no DB, e o user provavelmente não tem nenhum dos dois, **preciso verificar se há sessão ativa primeiro**.
   - Estratégia: `navigate_to_sandbox /checkout/{any-product-id}` → se redirecionar para customize, navego para o produto atual (`/product/capa-personalizada-why-tho`) e sigo o fluxo Personalizar.
2. Screenshot inicial — confirmar:
   - Barra fixa visível no rodapé (`fixed bottom-0`)
   - Total à esquerda, botão "Finalizar" à direita
   - Botão inline desktop **oculto** (`hidden lg:flex`)
3. Scroll até o topo → screenshot — barra continua fixa
4. Scroll até o final → screenshot — barra continua fixa, não sobrepõe `PaymentBadges` (graças ao `pb-28`)
5. Preencher CEP válido (ex: `01310-100` São Paulo) → aguardar shipping carregar → screenshot — confirmar que **total atualiza** (preço + frete) na barra
6. Preencher endereço completo (rua, número, bairro) → clicar "Finalizar" no sticky bar → observar:
   - Loading spinner aparece
   - Network request para `create-checkout` é disparado
   - **PARO antes do redirect Stripe** (não vou completar pagamento real)

### Ações destrutivas evitadas
- **NÃO vou completar o checkout no Stripe** (pagamento real). Paro no momento em que `create-checkout` é invocado e confirmo via `list_network_requests` que a função foi chamada com sucesso.
- Se a sessão já tiver endereços salvos, uso um existente para evitar criar dados.

### Saída
Checklist ✅/❌ de:
- Barra fixa em todas as posições de scroll
- Total = produto + frete após CEP
- Botão dispara `create-checkout` (sem completar pagamento)
- Sem regressão visual (botão inline desktop oculto, padding-bottom OK)

### Se bloquear
Se não houver `customization` em sessão e o redirect para `/customize` exigir upload de imagem real (que não posso fazer via browser), reporto o bloqueio e sugiro que o usuário inicie a customização manualmente, depois eu retomo o teste a partir do `/checkout`.
