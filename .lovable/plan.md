
The user wants me to test end-to-end that the camera button and gallery tab are properly disabled during AI filter processing. This requires browser automation which is available, but I'm in plan mode (read-only).

I'll present a plan to execute the browser test once approved.

## Plano de teste E2E

Verificar que durante a aplicação de um filtro IA:
1. Botão Camera no `PhonePreview` fica desabilitado
2. Aba Galeria em `ImageControls` fica com `pointer-events-none`

### Passos

1. `navigate_to_sandbox` em `/customize/galaxy-a05` (viewport 390x844)
2. Verificar estado inicial — se há `UploadSpotlight`, fazer upload de uma imagem da galeria
3. Aceitar `TermsDialog` se aparecer
4. Abrir aba "Filtros IA" e clicar em um filtro para iniciar processamento
5. Confirmar no `FilterConfirmDialog` (gasto de moedas)
6. **Durante o processamento** (`isProcessing = true`):
   - Tentar clicar no botão Camera → deve estar `disabled`
   - Abrir aba Galeria → conteúdo deve ter `opacity-50 pointer-events-none`
   - Tentar selecionar uma imagem da galeria → não deve responder
7. Screenshot do estado bloqueado
8. Aguardar conclusão e confirmar que controles voltam a funcionar

### Riscos / observações

- Se o usuário não estiver logado, o filtro IA dispara `LoginDialog` em vez de processar — abortar e reportar.
- Se faltar saldo de moedas, processo não inicia — reportar.
- Janela de "processamento" pode ser curta (poucos segundos); pode ser necessário tirar screenshot rapidamente após confirmação do dialog.
- Ações destrutivas: aplicar filtro consome moedas reais do usuário logado. Confirmar antes de prosseguir.

Após o teste, reporto os resultados (sucesso, falha ou limitações encontradas) sem editar código a menos que algum bug seja detectado.
