
## Migração PrintMyCase — Concluída

### Fases executadas

- ✅ Fase 1: `STRIPE_SECRET_KEY` adicionado aos secrets
- ✅ Fase 2: Edge Functions atualizadas (domínio, marca, origins)
- ✅ Fase 3: 6 email templates atualizados (logo URL, marca)
- ✅ Fase 4: Frontend atualizado (SEO, marca, contato, componentes)
- ✅ Deploy: 5 Edge Functions redeployadas

### Pendências

- **Upload do novo logo**: `logo-printmycase.png` precisa ser carregado no bucket `email-assets` e substituir os assets locais (`src/assets/logo-artiscase.*`)
- **Fase 5**: Configurar domínio customizado `printmycase.com.br` em Settings → Domains
- **Social images**: Atualizar og:image/twitter:image com novas imagens da marca
