

## Problema

O `UploadSpotlight` (overlay fullscreen `fixed inset-0 z-40`) cobre o `CustomizeHeader`, então o botão voltar (←) fica inacessível. No mobile, o spotlight ocupa `w-screen h-[100dvh]` em cima de tudo, sem permitir interação com o header.

Além disso, o `onBack` atual navega para `/customize` (rota que provavelmente é o `SelectModel`), mas a intenção esperada é voltar para o checkout / página anterior quando o usuário veio de lá, ou para a home/seleção.

## Correção

**Opção escolhida:** elevar o header acima do spotlight para que o botão voltar continue clicável mesmo com o overlay aberto.

### Mudanças

**`src/pages/Customize.tsx`**
- Envolver o `CustomizeHeader` com `relative z-50` (acima do spotlight z-40), garantindo que o botão voltar fique acessível.

**`src/components/customize/CustomizeHeader.tsx`**
- Sem mudanças funcionais; apenas garantir que o background seja sólido (`bg-background`) para que o header seja visível sobre o overlay escuro.

### Alternativa considerada (descartada)

Adicionar um botão "Voltar" dentro do próprio `UploadSpotlight`. Descartada porque duplicaria a navegação e o header já tem o botão voltar — basta torná-lo acessível.

### Comportamento do `onBack`

Mantém o `navigate("/customize")` atual (vai para a tela de seleção de modelo). Não é o foco do bug reportado.

### Resumo

- 2 arquivos editados
- Mudança mínima: ajuste de z-index e background no header
- Sem mudanças de comportamento, apenas acessibilidade do botão voltar quando o spotlight de upload está aberto

