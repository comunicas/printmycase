

## Plano: Atualizar `.lovable/plan.md` com status final

O arquivo está desatualizado. Vou atualizá-lo refletindo:
- Domínio correto: `studio.printmycase.com.br` (já configurado ✅)
- Social images já configuradas ✅
- Referências ArtisCase/ArtisCoins removidas do código ✅
- ARCHITECTURE.md atualizado ✅
- Pendência restante: upload do logo no bucket `email-assets`

### Arquivo alterado
- `.lovable/plan.md` — reescrita completa com checklist atualizado

### Conteúdo proposto

```markdown
## Migração PrintMyCase — Status Final

### Fases concluídas

- ✅ Fase 1: `STRIPE_SECRET_KEY` adicionado aos secrets
- ✅ Fase 2: Edge Functions atualizadas (domínio, marca, origins) e redeployadas
- ✅ Fase 3: 6 email templates atualizados (logo URL, marca)
- ✅ Fase 4: Frontend atualizado (SEO, marca, contato, componentes)
- ✅ Fase 5: Domínio `studio.printmycase.com.br` configurado
- ✅ Social images: og:image e twitter:image configurados no index.html
- ✅ Código: todas as referências "ArtisCase"/"ArtisCoins" removidas
- ✅ ARCHITECTURE.md atualizado para PrintMyCase

### Pendências

- **Upload do logo**: `logo-printmycase.png` precisa ser carregado no bucket `email-assets` para os emails transacionais
```

