
## Revisão pós-implementações

### Bugs encontrados

**1. Legado no `PhonePreview` — UI duplicada de upload**
Quando não há imagem, o `PhonePreview` ainda renderiza um bloco "Envie sua foto aqui" + "Ou escolha da galeria" (linhas 247-276). Isso é legado: agora o `UploadSpotlight` cobre a tela inteira sobre o preview. O bloco é invisível mas ainda monta input file, handlers e listeners desnecessários.
→ **Remover** o branch `{!image && ...}` e o input file órfão. Manter só o estado vazio do frame (frame vazio fica "atrás" do spotlight, o que está correto).

**2. `UploadSpotlight` z-index conflita com `TermsDialog`**
- `UploadSpotlight`: `z-50`
- `Dialog` (Radix) overlay: `z-50` também
- `IntroDialog`: usa `z-[110]` para ficar acima

Quando o usuário clica "Escolher foto" → upload dispara → `TermsDialog` abre por cima do spotlight. Eles têm o mesmo `z-50`, e como o spotlight ainda está montado (não há imagem), pode sobrepor o dialog em alguns navegadores.
→ Como `IntroDialog` já usa `z-[110]`, aplicar `z-[100]` no `UploadSpotlight` para garantir que `TermsDialog` (z-50 do Radix portal) fique acima quando ambos abertos? Não — o correto é o contrário: spotlight deve ficar **abaixo** de qualquer dialog modal. Manter `z-50` é OK desde que o dialog suba. **Ajustar o spotlight para `z-40`** para garantir hierarquia limpa: spotlight (z-40) < dialogs Radix (z-50) < IntroDialog (z-110). Isso resolve o problema reportado nos turnos anteriores.

**3. `IntroDialog` — variável `opacity` declarada e não usada**
Linha 175 declara `let opacity = "1"` que nunca é lida (só `transform` e `exitPhase` são usados no JSX). Lixo morto.
→ Remover.

**4. `IntroDialog` — bloco `enterPhase` vazio sem efeito**
Linhas 179-182: comentário sem código, indica intenção não implementada. Não causa bug, mas é ruído.
→ Remover branch vazio.

**5. Linha em branco extra no `Customize.tsx`**
Linhas 11→12, 75 (vazia dentro de props), 208-209 (duas linhas em branco). Pequena limpeza estética.
→ Limpar.

### Não são bugs (verificado)

- `MobileTabBar` já desabilitada quando `!c.image` ✅
- `ContinueBar` mobile já desabilitado quando `!c.image` ✅
- `TermsDialog` já fullscreen mobile ✅
- `handleSpotlightFile` reseta `e.target.value` corretamente ✅
- Texto "Sua foto vira capa para {modelName}" correto ✅

### Mudanças propostas

**`src/components/PhonePreview.tsx`**
- Remover bloco `{!image && (...)}` (linhas 247-276) — legado substituído pelo `UploadSpotlight`.
- Remover `<input ref={inputRef} type="file" .../>` se não for mais usado pelo botão Camera (manter — botão Camera ainda usa para trocar foto).
- Verificar: `inputRef` continua necessário para o botão Camera (linha 302). Manter o input, remover só o bloco visual de upload vazio.

**`src/components/customize/UploadSpotlight.tsx`**
- Mudar `z-50` → `z-40` para hierarquia clara abaixo dos dialogs.

**`src/components/customize/IntroDialog.tsx`**
- Remover variável `opacity` não usada (linha 175).
- Remover `enterPhase` vazio (linhas 179-182) — manter só cálculo de `transform` no inline-style.

**`src/pages/Customize.tsx`**
- Remover linhas em branco redundantes (11, 75, 209).

**`ARCHITECTURE.md`**
- Adicionar nota na seção de Customização sobre o novo fluxo de onboarding:
  - `UploadSpotlight` (z-40) cobre o preview quando não há imagem, exibindo CTAs de upload/galeria.
  - `MobileTabBar` e `ContinueBar` ficam desabilitados enquanto o spotlight está ativo.
  - `TermsDialog` é fullscreen no mobile, seguindo o padrão `IntroDialog`/`UploadSpotlight`.

### Resumo

- 4 arquivos editados (`PhonePreview`, `UploadSpotlight`, `IntroDialog`, `Customize`)
- 1 arquivo de documentação (`ARCHITECTURE.md`)
- Sem mudanças de comportamento — apenas remoção de legado, ajuste de z-index e limpeza
