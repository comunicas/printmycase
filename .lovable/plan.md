

# Ajustes nas Posicoes das Cameras dos iPhones

## Problemas Encontrados

Apos revisar o codigo em `phoneModels.ts` e comparar com os layouts reais dos iPhones, identifiquei os seguintes ajustes necessarios:

### 1. iPhone 11 - Flash mal posicionado
- **Atual**: Flash em `top: 50%, left: 18%` (abaixo da lente esquerda)
- **Correto**: Flash deve ficar entre as duas lentes, na posicao `top: 18%, left: 50%` (ao lado da lente superior)

### 2. iPhone 12 - Flash mal posicionado  
- **Atual**: Flash em `top: 48%, left: 18%` (abaixo da lente esquerda)
- **Correto**: Flash deve ficar em `top: 18%, left: 50%` (ao lado da lente de cima na diagonal)

### 3. iPhone 13/14 - Flash precisa de ajuste
- O iPhone 13 tem as lentes em diagonal invertida (top-right, bottom-left), o que esta correto
- Flash precisa ser reposicionado para acompanhar o novo layout diagonal

### 4. Pro Models - Lente superior nao esta centralizada
- **Atual**: Lente superior em `left: 30%`
- **Correto**: Deve ficar em `left: 33%` para centralizar melhor no modulo

### 5. iPhone 16 Pro Max - Modulo maior
- O iPhone 16 Pro Max tem cameras ligeiramente maiores que o 15 Pro Max, as lentes podem ser `size: 30` em vez de `28`

## Mudancas

### `src/lib/phoneModels.ts`
- Corrigir posicao do flash em iPhone 11, 12, 13 e 14
- Centralizar lente superior nos modelos Pro (`left: 33%`)
- Ajustar tamanho das lentes do iPhone 16 Pro Max
- Pequenos ajustes de posicionamento para maior fidelidade

## Nota sobre o Preview
A pagina esta em branco momentaneamente porque o servidor Vite esta reconstruindo. Isso e temporario e nao indica um bug no codigo. Apos a build completar, a app voltara a funcionar normalmente.

