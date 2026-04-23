
Objetivo: eliminar os warnings de console relacionados a `ref` em componentes React para que a página de customização fique 100% limpa, sem ruído vindo do CTA/preview nem dos diálogos abertos nessa jornada.

## Diagnóstico confirmado
O warning atual aponta para:
- `TermsDialog`
- `DialogFooter`
- wrapper interno de `src/components/ui/dialog.tsx`

Hoje:
- `DialogOverlay`, `DialogContent`, `DialogTitle` e `DialogDescription` já usam `React.forwardRef`
- `DialogHeader` e `DialogFooter` ainda são function components simples, sem `forwardRef`

Como esses wrappers aparecem como filhos diretos em estruturas Radix, o React/Radix pode tentar anexar refs neles, gerando o warning:
```text
Function components cannot be given refs
```

Isso bate com a regra já registrada no projeto:
- componentes renderizados como filhos diretos de elementos Radix devem usar `React.forwardRef`

## O que será corrigido

### 1) Ajustar `DialogHeader` e `DialogFooter` para `forwardRef`
Em `src/components/ui/dialog.tsx`:
- converter `DialogHeader` para `React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>`
- converter `DialogFooter` para `React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>`
- preservar classes, API pública e `displayName`

Resultado esperado:
- `TermsDialog` deixa de emitir warning ao abrir
- qualquer outro modal que use `DialogHeader`/`DialogFooter` também herda a correção

### 2) Fazer uma limpeza preventiva nos componentes da jornada de customização
Validar os diálogos usados em `/customize/:slug`:
- `TermsDialog`
- `LowResolutionDialog`
- `FilterConfirmDialog`
- `UpscaleConfirmDialog`
- `LoginDialog`
- `IntroDialog`

Objetivo:
- garantir que nenhum wrapper customizado usado como filho de Radix esteja sem `forwardRef`
- evitar que o preview/CTA pareça “culpado” por warnings originados em modais auxiliares

### 3) Manter intacto o CTA recém-adicionado no frame
Nenhuma mudança visual no CTA será necessária, a menos que a auditoria encontre algum wrapper do preview usando `asChild` ou recebendo ref indevido.

Resultado esperado:
- o CTA continua com glow/animação suave
- o console fica limpo ao abrir a página, interagir com upload e abrir dialogs da jornada

## Arquivos impactados

### `src/components/ui/dialog.tsx`
Mudança principal:
- migrar `DialogHeader` e `DialogFooter` para `forwardRef`

### Possíveis arquivos de verificação sem mudança estrutural grande
- `src/components/customize/TermsDialog.tsx`
- `src/components/customize/LowResolutionDialog.tsx`
- `src/components/customize/FilterConfirmDialog.tsx`
- `src/components/customize/UpscaleConfirmDialog.tsx`
- `src/components/customize/LoginDialog.tsx`
- `src/components/customize/IntroDialog.tsx`

## Estratégia de implementação
1. Atualizar wrappers do sistema de dialog para aceitar ref corretamente.
2. Revisar os modais da jornada de customização para confirmar que não há outro wrapper equivalente quebrando a regra.
3. Validar que o comportamento visual e responsivo continua igual.
4. Confirmar que o console não mostra mais warning de `Function components cannot be given refs`.

## Check final documentado

### Console
- não aparece mais warning de `Function components cannot be given refs`
- abrir `TermsDialog` não gera erro
- abrir dialogs auxiliares da customização não gera erro

### Preview / CTA
- CTA dentro do frame continua aparecendo apenas sem imagem
- clicar no CTA continua abrindo o seletor de arquivos
- após upload, CTA desaparece normalmente

### Regressão visual
- headers e footers dos dialogs mantêm layout atual
- mobile continua fullscreen com cantos retos
- desktop continua com card central e cantos arredondados

### Regressão funcional
- botões de cancelar/confirmar continuam funcionando
- overlays dos dialogs continuam abrindo/fechando normalmente
- nenhum comportamento da página `/customize/:slug` é alterado além da limpeza de warnings

## Resultado esperado
Depois da correção, o preview de customização e seus modais associados ficam com o console limpo, sem warnings de refs, preservando a UX atual e garantindo uma base mais robusta para futuras interações com CTA, upload e diálogos.
