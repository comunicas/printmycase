

## Plano: Usar valores dinâmicos de indicação na página /coins

### Problema
Na seção de indicação da página `/coins` (linha 178), os valores estão hardcoded como **"50 moedas"**. Eles deveriam refletir os valores configurados no admin (`referral_bonus_amount` e `signup_bonus_amount` da tabela `coin_settings`).

### Alteração

**`src/pages/Coins.tsx`**
- Importar e usar `useCoinSettings()` para obter os valores dinâmicos
- Substituir os dois "50 moedas" hardcoded por:
  - `getSetting("referral_bonus_amount", 50)` — valor que o indicador ganha
  - `getSetting("signup_bonus_amount", 50)` — valor que o indicado ganha ao se cadastrar
- Isso garante que ao alterar os valores no admin, a página de moedas reflete automaticamente

### Arquivo alterado
- `src/pages/Coins.tsx`

