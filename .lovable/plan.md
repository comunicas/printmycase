

## Aceite dos Termos de Uso antes do envio de imagem

### Resumo
Exibir um dialog de aceite dos termos de uso na primeira vez que o usuário tenta enviar uma imagem na página de customização. O aceite fica salvo em `localStorage` para não repetir.

### Alterações

**1. Novo componente `src/components/customize/TermsDialog.tsx`**
- Dialog com o texto dos termos (marcas, famosos, conteúdo proibido, aviso de cancelamento)
- Botão "Li e aceito os termos" para confirmar
- Botão cancelar que fecha sem aceitar

**2. `src/hooks/useCustomize.tsx`**
- Novo estado `showTermsDialog` (boolean)
- Novo estado `pendingFile` (File | null) para guardar o arquivo enquanto aguarda aceite
- No `handleImageUpload`: se o usuário nunca aceitou os termos (`localStorage.getItem('pmc_terms_accepted') !== 'true'`), salvar o file em `pendingFile` e abrir o dialog em vez de processar
- Nova função `handleTermsAccept`: salva aceite no `localStorage`, processa o `pendingFile`, limpa estado
- Exportar `showTermsDialog`, `setShowTermsDialog`, `handleTermsAccept`

**3. `src/pages/Customize.tsx`**
- Importar e renderizar `TermsDialog`
- Conectar aos estados/handlers do hook

### Fluxo
1. Usuário clica para enviar imagem → `handleImageUpload` é chamado
2. Se termos não aceitos → file guardado, dialog abre
3. Usuário aceita → `localStorage` marcado, imagem processada normalmente
4. Próximas imagens → sem dialog (já aceitou)

