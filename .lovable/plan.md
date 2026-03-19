

## Plano: Documentos Legais e Referências Pendentes

### Situação atual
A tabela `legal_documents` está **vazia** — não há conteúdo para substituir "ArtisCase" por "PrintMyCase". Os documentos precisam ser **criados** primeiro pelo admin no painel (aba "Documentos Legais").

### Correção encontrada no código
Existe **1 referência residual** a "ArtisCoins" no código:

| Arquivo | Texto atual | Texto novo |
|---------|-------------|------------|
| `src/components/customize/LoginDialog.tsx` (linha 113) | `🎁 Ganhe 50 ArtisCoins grátis!` | `🎁 Ganhe 50 moedas grátis!` |

### Ações
1. Corrigir a referência "ArtisCoins" em `LoginDialog.tsx`
2. Os documentos legais devem ser criados via painel admin — não há dados existentes para migrar

### Arquivos alterados
- `src/components/customize/LoginDialog.tsx`

