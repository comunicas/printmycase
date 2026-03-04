

# Melhorias pontuais + Sugestões de próximas fases

## 1. Remover toast "Imagem original muito grande"

Em `src/pages/Customize.tsx` (linha 214), remover o `toast()` no fallback do sessionStorage. O fallback continua funcionando (salva sem a imagem original), apenas sem notificar o usuário.

## 2. Esconder formulário quando endereço salvo está selecionado

Em `src/components/checkout/AddressForm.tsx`, envolver o `<FormCard>` (linhas 186-256) com uma condição: só exibir quando `!selectedAddressId`. Quando o usuário seleciona um endereço salvo, o formulário fica oculto — mostrando apenas os chips de seleção e um resumo compacto do endereço selecionado (rua, número, cidade/estado).

## Arquivos afetados

| Arquivo | Mudança |
|---------|---------|
| `src/pages/Customize.tsx` | Remover toast na linha 214 |
| `src/components/checkout/AddressForm.tsx` | Esconder form quando endereço selecionado, mostrar resumo |

---

## Sugestões para próxima fase

Após 4 fases de consolidação, o projeto está bem estruturado. Algumas direções possíveis:

1. **Histórico de pedidos com tracking visual** — Timeline de status na página /orders com notificações
2. **Múltiplas quantidades e carrinho** — Permitir comprar mais de uma capa por checkout
3. **Cupons de desconto** — Integração com Stripe Coupons na tela de checkout
4. **Dashboard admin com métricas** — Vendas, receita, pedidos por status (gráficos)
5. **PWA e notificações push** — Instalar como app, notificar quando pedido mudar de status

