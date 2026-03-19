

## Plano: Remover custo geração IA e reorganizar layout de bônus

### Alterações

#### 1. Banco de dados
Remover o registro `ai_generation_cost` da tabela `coin_settings`:
```sql
DELETE FROM public.coin_settings WHERE key = 'ai_generation_cost';
```

#### 2. `src/components/admin/CoinsManager.tsx`

**a) Remover label** `ai_generation_cost` do mapa `settingLabels` (linha 43).

**b) Reorganizar seção Bônus** — substituir o grid genérico que lista todos os settings com "bonus" por 3 pares explícitos em linha (amount + days lado a lado):

```text
┌─────────────────────┬──────────────────────┐
│ Bônus compra (moedas)│ Validade (dias)      │
├─────────────────────┼──────────────────────┤
│ Bônus indicação     │ Validade (dias)       │
├─────────────────────┼──────────────────────┤
│ Bônus cadastro      │ Validade (dias)       │
└─────────────────────┴──────────────────────┘
```

Cada linha será um `grid grid-cols-2 gap-3` com o par amount/days agrupado, em vez do grid 3-colunas atual que mistura amounts e days sem ordem lógica.

#### Arquivos alterados

| Arquivo | Alteração |
|---------|-----------|
| Banco de dados | DELETE `ai_generation_cost` |
| `src/components/admin/CoinsManager.tsx` | Remover label + reorganizar bônus em pares |

