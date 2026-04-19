
User quer teste E2E no mobile (390px) de:
1. Header não-fixo (sai do topo ao rolar)
2. Botão "Voltar" funcional
3. Seção "Designs semelhantes" com links válidos

Já estou em `/colecao/creative/capa-personalizada-heck-yeah`. Plano enxuto:

## Teste E2E — DesignPage mobile (390px)

### Roteiro
1. `navigate_to_sandbox` em 390×844 → `/colecao/creative/capa-personalizada-heck-yeah`
2. **Screenshot topo** — confirmar header visível + botão "Voltar" abaixo
3. **Scroll até o fim** — screenshot confirmando:
   - Header saiu do viewport (não é mais sticky)
   - Sticky bar de checkout fixa no rodapé
   - Seção "Designs semelhantes" renderizada com cards
4. **Observe** os cards de designs semelhantes para validar `href` (`/colecao/creative/...`)
5. **Scroll back to top** + clicar "Voltar" → confirmar `navigate(-1)` funciona (volta para a coleção/listagem anterior)
6. **Screenshot final** após voltar — confirmar destino

### Saída
Checklist:
- [ ] Header rola junto com o conteúdo (não-sticky)
- [ ] Botão Voltar visível e funcional
- [ ] Designs semelhantes renderizados com links `/colecao/{slug}/{designSlug}`
- [ ] Sticky bar de checkout permanece fixa

Sem mudanças de código previstas — apenas validação.
