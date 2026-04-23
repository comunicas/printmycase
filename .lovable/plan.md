
Objetivo: corrigir a customização para remover o CTA de contato do rodapé, restaurar o foco de conversão do footer como antes, e trocar o contato do header por uma modal simples dentro do fluxo, sem tirar o usuário da navegação de `/customize/:slug`.

## O que será alterado

### 1) Remover o CTA de contato do rodapé
O ícone de contato será retirado do `ContinueBar` em todas as variações.

Resultado:
- o rodapé volta a priorizar conversão
- some a distração lateral perto do botão `Finalizar`
- o layout retorna ao padrão anterior, mantendo reset/download/finalizar

Arquivo:
- `src/components/customize/ContinueBar.tsx`

### 2) Restaurar o footer com foco em conversão
O `ContinueBar` será reequilibrado para ficar visualmente centrado na ação principal.

Direção:
- preservar o botão `Finalizar` como ação dominante
- manter o reset como ação secundária apenas quando houver modificação
- manter download apenas quando aplicável
- remover qualquer elemento que concorra com a decisão de compra/continuidade

Observação:
- isso respeita a memória do projeto de manter o botão `Finalizar` simples, direto e sem ruído extra

### 3) Trocar o contato do header por modal simples
O botão de contato no topo deixará de navegar para `/contato` e passará a abrir uma modal leve dentro da própria tela de customização.

Objetivo da modal:
- evitar saída de contexto
- permitir contato rápido sem interromper o fluxo
- manter UX discreta e direta

Arquivos:
- `src/components/customize/CustomizeHeader.tsx`
- novo componente dedicado, seguindo o padrão existente de dialogs da customização

### 4) Criar uma modal de contato enxuta
A modal será propositalmente simples e rápida de preencher, inspirada no formulário atual de `/contato`, mas adaptada para uso contextual.

Estrutura sugerida:
```text
[título curto]
[descrição curta]

[nome]
[email]
[mensagem]

[cancelar] [enviar]
```

Campos:
- Nome
- Email
- Mensagem
- honeypot invisível `website` preservado para anti-spam

Comportamento:
- envio usando a mesma function já usada na página de contato
- feedback claro de loading, sucesso e erro
- fechamento simples após envio com confirmação curta

Arquivos:
- novo componente de modal de contato em `src/components/customize/`
- reutilização da integração já existente de `submit-contact`

### 5) Manter a modal consistente com o padrão visual atual
A modal de contato seguirá a linguagem já usada na customização.

Direção visual:
- mobile fullscreen
- desktop também fullscreen, acompanhando o padrão recente dos dialogs
- header/body/footer bem definidos
- animações e foco visível consistentes com `Dialog`
- copy curta e objetiva para não competir com o fluxo principal

### 6) Preservar acessibilidade e fluxo
A nova solução precisa continuar funcional para teclado e leitores de tela.

Implementação prevista:
- botão do header com `aria-label` claro
- foco inicial no conteúdo da modal
- labels adequados nos campos
- mensagens de erro/sucesso compreensíveis
- fechamento por botão explícito e comportamento padrão de dialog

## Arquivos impactados

### `src/components/customize/ContinueBar.tsx`
Será ajustado para:
- remover o ícone/link de contato
- restaurar o arranjo anterior com foco no CTA principal

### `src/components/customize/CustomizeHeader.tsx`
Será ajustado para:
- substituir navegação para `/contato` por abertura de modal local
- controlar estado `open` da modal de contato

### Novo componente de contato da customização
Será criado para:
- renderizar a modal simples
- conter o formulário enxuto
- reaproveitar a lógica de envio para `submit-contact`

### Possível reutilização de:
- `src/components/ui/dialog.tsx`
- `src/components/ui/form-field.tsx`
- `src/components/ui/input.tsx`
- `src/components/forms/SubmitButton.tsx`
- `src/hooks/use-toast.ts`

## Abordagem de implementação
1. Remover o CTA de contato do `ContinueBar`.
2. Restaurar o layout do rodapé para priorizar `Finalizar`.
3. Adicionar estado local de abertura da modal no header.
4. Criar a modal simples de contato com formulário enxuto.
5. Integrar o envio com a mesma function usada em `/contato`.
6. Exibir feedback de loading, sucesso e erro sem sair da página.
7. Validar responsividade, acessibilidade e ausência de conflito com z-index/dialogs existentes.

## Check final documentado

### Rodapé
- contato removido do footer
- conversão volta a ser a prioridade visual
- reset/download/finalizar continuam corretos

### Header
- botão de contato não navega mais para outra página
- abre modal simples dentro da customização

### Modal
- formulário é curto e claro
- envio funciona sem sair do fluxo
- sucesso/erro ficam compreensíveis
- mobile e desktop respeitam o padrão fullscreen atual

## Resultado esperado
Depois do ajuste, o rodapé da customização volta a ficar limpo e orientado à conversão, enquanto o contato permanece acessível no topo através de uma modal simples e contextual, sem tirar o usuário da navegação principal.
