
Atualizar a safe zone do preview para crescer mais 10px em todos os aparelhos, sem perder o alinhamento com o contorno do frame.

1. Ajustar a base global da safe zone
- Em `src/components/PhonePreview.tsx`, aumentar o `height` do `DEFAULT_SAFE_ZONE_PRESET` em mais `10px`.
- Como o pedido é “aplicar para todos os modelos”, a base global passará a incorporar esse acréscimo extra para qualquer aparelho sem preset específico.

2. Ajustar todos os presets já mapeados
- No objeto `SAFE_ZONE_PRESETS`, somar mais `10px` ao `height` de cada modelo específico já configurado:
  - `iphone-12-pro-max`
  - `iphone-15-pro-max`
  - `iphone-17-pro`
- Onde hoje houver valores percentuais puros, converter para `calc(...)` para preservar a proporção original e acrescentar o deslocamento fixo adicional.

3. Preservar o encaixe visual nas bordas
- Manter `insetX`, `top`, `radius` e `bottomRadius` como estão inicialmente, mudando apenas a altura.
- Se algum modelo perder o contorno visual após o aumento, fazer microajustes somente no próprio preset desse aparelho, sem alterar a lógica geral do componente.

4. Validar o comportamento do toggle existente
- Garantir que o aumento respeite o toggle `showSafeZone`, sem alterar a interação atual.
- Confirmar que o overlay continua aparecendo e desaparecendo corretamente tanto no desktop quanto no mobile.

Detalhes técnicos
- Arquivo principal: `src/components/PhonePreview.tsx`
- Mudança esperada:
```ts
const DEFAULT_SAFE_ZONE_PRESET = {
  ...
  height: "calc(17% + 20px)",
};
```
- E, para os presets específicos, seguir o mesmo padrão:
```ts
height: "calc(valor-atual + 10px)"
```
- Exemplo:
  - se estiver `calc(17% + 10px)`, passará para `calc(17% + 20px)`
  - se estiver `15.2%`, passará para `calc(15.2% + 10px)`
