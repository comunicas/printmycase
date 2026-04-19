
User confirmou que já está logado e já chegou no checkout (vejo no replay: clicou em "Finalizar Pedido", request `create-checkout` retornou URL Stripe às 05:23:33, depois voltou para `/`). Preciso retomar do zero: navegar para o checkout novamente.

Pelo replay e network: produto `6258a562` (Galaxy S24+), design `14ef96a5` (Why Tho), usuário tem endereço salvo (`732d663b`), CEP já entrou shipping de R$ 12,90. O fluxo funcionou end-to-end uma vez.

## Retomar teste E2E — sticky bar checkout mobile (390px)

### Roteiro

1. `navigate_to_sandbox` em 390×844 → ir até `/colecao/creative/capa-personalizada-why-tho` (página do design) e clicar em "Personalizar"/"Comprar" para chegar ao checkout com sessão válida. Se não for possível, tentar direto `/checkout/6258a562-123b-4ab9-8039-4edbc1ee4291` (pode redirecionar se sessionStorage estiver vazio).
2. **Screenshot inicial** — confirmar barra fixa no rodapé com "Total" + botão "Finalizar"
3. **Scroll up/down** — screenshot no topo e no fim para verificar:
   - Barra continua `fixed bottom-0` em todas posições
   - `PaymentBadges` não fica oculto sob a barra (graças ao `pb-28`)
4. **CEP**: se shipping não estiver carregado, preencher `01310-100` → aguardar → screenshot confirmando que **total na barra atualiza** de R$ 89,90 para R$ 89,90 + frete
5. **Clicar "Finalizar"** no botão da barra sticky → observar:
   - Loading spinner aparece no botão
   - `list_network_requests` mostra POST para `create-checkout` retornando 200
   - **PARO antes de seguir o redirect Stripe** (não completo pagamento real)

### Ações destrutivas
- Não completar pagamento Stripe (paro no momento que recebo a URL)
- Usar endereço já salvo (`Casa - Rua Doutor Samuel Porto`) — não criar novo

### Saída
Checklist objetivo:
- [ ] Barra fixa no topo do scroll
- [ ] Barra fixa no fim do scroll (sem sobrepor PaymentBadges)
- [ ] Total atualiza com frete na barra
- [ ] Botão Finalizar dispara `create-checkout` com sucesso
- [ ] Botão desktop oculto no mobile (`hidden lg:flex`)

Sem mudanças de código.
