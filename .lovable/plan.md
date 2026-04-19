
## Teste end-to-end: descrição + galeria de design

### Escopo
Validar via browser automation que:
1. Admin → CollectionDesignsManager mostra os novos campos (textarea descrição + uploader múltiplo)
2. É possível editar um design existente, adicionar descrição e imagens extras, salvar
3. DesignPage pública renderiza descrição + thumbnails da galeria

### Plano

**Fase 1 — Admin**
- Navegar `/admin` (assumindo usuário já logado como admin no preview)
- Abrir aba/seção de Designs de Coleção
- Selecionar coleção "Brasil"
- Abrir edição do design "pixel-bandeira" (rota atual do usuário)
- Verificar presença dos campos novos: textarea "Descrição" e input "Imagens adicionais"
- Preencher descrição de teste (ex: "Design exclusivo inspirado na bandeira do Brasil em estilo pixel art.")
- *Não* fazer upload de imagem real (file upload via browser automation é instável); apenas confirmar que o input multi-file existe e está habilitado
- Salvar e confirmar toast de sucesso

**Fase 2 — Página pública**
- Navegar `/colecao/brasil/pixel-bandeira`
- Confirmar bloco de descrição renderizado com o texto salvo
- Confirmar galeria (mesmo que só capa, validar estrutura)
- Screenshot final

**Fase 3 — Relatório**
- Reportar o que funcionou, o que não foi possível testar (upload real de arquivo), e qualquer bug encontrado
- Se bug: parar e avisar antes de seguir

### Risco
- Upload de arquivo real via browser automation costuma falhar; vou validar apenas a presença do controle
- Se admin exigir login, paro e peço ao usuário para logar

### Sem alterações de código nesta task
Apenas QA via browser.
