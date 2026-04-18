
## Plano: limpeza completa de legados e erros da home

Auditoria completa identificou 5 áreas de débito técnico. Plano em fases independentes, cada uma testável isoladamente.

---

### Fase 1 — Remover asset órfão `src/assets/logo-printmycase.png`

**Problema**: arquivo PNG existe em `src/assets/` mas **zero referências** no código. Todos os usos do logo apontam para `email-assets/logo-printmycase.png` (Supabase Storage) ou `/logo-printmycase-sm.webp` (público otimizado).

**Ação**: deletar `src/assets/logo-printmycase.png`.

**Risco**: nenhum (verificado por grep — não importado em lugar algum).

---

### Fase 2 — Eliminar fallback marquee inalcançável + 5 imagens órfãs

**Problema**: `AiCoinsSection.tsx` tem branch `else` (carrossel marquee com `ai-showcase-1..5-sm.webp`) que **nunca mais será exibido** após o fix da view `public_ai_generations` (28 itens públicos garantidos em produção). O código:
- 30+ linhas mortas (`showcaseImages`, branch fallback)
- 5 arquivos `ai-showcase-*-sm.webp` em `/public/lovable-uploads/` (~50 KB)
- Animação CSS `animate-marquee` no Tailwind config (verificar se usada em outro lugar)

**Ação**:
1. Em `AiCoinsSection.tsx`: remover `showcaseImages`, branch `else` e ternário (`hasPublicImages ? grid : marquee`) — manter só o grid mosaico. Quando `images.length === 0` (caso extremamente raro), renderizar `null` ou skeleton mínimo.
2. Deletar os 5 arquivos `public/lovable-uploads/ai-showcase-[1-5]-sm.webp`.
3. Verificar `tailwind.config.ts` — se `animate-marquee` for exclusivo desta seção, remover keyframe.

**Risco**: baixo. Cobertura de produção: 28 itens >> 8 limit, não há cenário realista de fallback.

---

### Fase 3 — Tratamento de erro explícito na query de gerações

**Problema**: query atual cai silenciosamente em fallback se RLS/permissão quebrar de novo (foi exatamente o bug que descobrimos hoje). Sem log, sem alerta.

**Ação**: adicionar `.then(({ data, error }) => { if (error) console.error('public_ai_generations:', error); ... })` em `AiCoinsSection.tsx` linha 40. Sentinela contra regressão futura.

**Risco**: zero.

---

### Fase 4 — Sanitizar `filter_name` na exibição pública

**Problema**: confirmado via SQL — todos os `filter_name` na view pública têm 100 chars truncados de **prompts brutos** ("Reorganize the provided image maintaining its original visua...", "Crie uma imagem com base na orignal ccom estilo..."). Vazam prompt engineering, têm typos ("orignal ccom"), são em inglês misturado com português. Truncar para 20 chars na UI **não resolve** — só mostra fragmento ininteligível.

**Ação** (escolher uma abordagem na execução):
- **Opção A (recomendada)**: na view `public_ai_generations`, fazer JOIN com `ai_filters` table e expor `ai_filter.name` (nome curador) em vez de `user_ai_generations.filter_name` (prompt cru). Migração SQL apenas, sem mudança de código frontend.
- **Opção B**: ocultar o badge `filter_name` na UI quando >25 chars ou quando contém palavras-chave de prompt ("Create", "Transform", "Reorganize", "imagem com base").

Decisão final na fase de execução, após inspecionar schema de `ai_filters`.

**Risco**: médio (Opção A requer entender relacionamento entre `user_ai_generations` e `ai_filters`).

---

### Fase 5 — Remover edge function one-shot `migrate-generation-urls`

**Problema**: edge function criada para migração única (gerações com URLs assinadas/expiradas → bucket público). Não é chamada por nenhum cliente (`grep` confirma zero referências fora do próprio arquivo). Limita-se a 5 registros por execução, claramente script ad-hoc.

**Ação**:
1. Confirmar via SQL que não há mais `image_url` com `/sign/` ou `token=` para migrar.
2. Se zero pendentes: deletar `supabase/functions/migrate-generation-urls/`.
3. Se ainda houver: rodar uma última vez, depois deletar.

**Risco**: baixo, validável por SQL antes de excluir.

---

### Ordem de execução sugerida

| Ordem | Fase | Dependências | Tempo |
|---|---|---|---|
| 1 | Fase 3 (error handling) | nenhuma | 2 min |
| 2 | Fase 1 (logo PNG órfão) | nenhuma | 1 min |
| 3 | Fase 2 (marquee + 5 webp) | depende de Fase 3 estar em prod sem erros | 5 min |
| 4 | Fase 4 (filter_name) | independente | 10 min |
| 5 | Fase 5 (edge function) | requer SQL check | 5 min |

### Não incluído (já tratado / fora de escopo)

- Favicon 56 KB (já há plano separado aprovado).
- `placeholder.svg`, `logo-printmycase-sm.webp`, `robots.txt`, `llms.txt` — todos em uso ou imutáveis.
- Imagens em `src/assets/hero-bg-optimized.webp` — em uso (LCP).

### Aprovação

Aprove para executar **todas as 5 fases sequencialmente**, ou indique quais deseja pular/priorizar.
