

## Adicionar custo IA para geração de imagens no painel de moedas

### Contexto
Atualmente existem dois custos IA configuráveis: `ai_filter_cost` e `ai_upscale_cost`. A geração de imagens (`generate-gallery-image`) é restrita a admins e não cobra moedas. O usuário quer adicionar um novo setting `ai_generation_cost` para futura cobrança de geração de imagens IA.

### Alterações

#### 1. Inserir novo registro na tabela `coin_settings` (migration de dados)
```sql
INSERT INTO public.coin_settings (key, value, description)
VALUES ('ai_generation_cost', 5, 'Custo em moedas para geração de imagem IA')
ON CONFLICT DO NOTHING;
```

#### 2. Atualizar labels no `CoinsManager.tsx`
Adicionar ao mapa `settingLabels`:
```
ai_generation_cost: "Custo geração IA (moedas)"
```

Isso fará o novo campo aparecer automaticamente na seção "Custos IA" (que já filtra por keys contendo "cost"), sem necessidade de alterar o layout.

### Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| Banco de dados | INSERT do novo setting `ai_generation_cost` |
| `src/components/admin/CoinsManager.tsx` | Adicionar label `ai_generation_cost` ao `settingLabels` |

