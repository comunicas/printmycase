

## Fase 2 — Conteúdo "Minha Conta" na Base de Conhecimento

### O que será feito

Inserir 1 nova categoria e 4 artigos via SQL (insert tool), com conteúdo real baseado nas funcionalidades existentes da página de perfil.

### Nova Categoria

| Nome | Slug | Ícone | sort_order |
|------|------|-------|------------|
| Minha Conta | minha-conta | User | 5 |

### Artigos (4)

1. **Como criar minha conta no Studio PrintMyCase** — cadastro com e-mail/senha ou Google, verificação de e-mail, código de indicação
2. **Como editar meu perfil** — alterar nome, telefone, foto (máx 2 MB), e-mail exibido mas não editável
3. **Como alterar minha senha** — mínimo 6 caracteres, fluxo de redefinição via "Esqueci minha senha"
4. **Como excluir minha conta** — ação irreversível, digitar "EXCLUIR" para confirmar, dados removidos permanentemente

### Detalhes técnicos

- Inserir 1 registro em `kb_categories` e 4 em `kb_articles` usando o insert tool (não migration, pois é apenas dados)
- Conteúdo Markdown real baseado na página `Profile.tsx` e fluxos de Login/Signup
- Aparece imediatamente no admin existente

