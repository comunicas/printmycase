
## Analisar bundle real com rollup-plugin-visualizer

### Objetivo
Rodar `vite build`, gerar visualização interativa dos chunks reais e identificar oportunidades concretas de otimização (chunks gordos, duplicação, vazamento admin→público).

### Plano

**Fase 1 — Instalar visualizer (devDep)**
- `npm i -D rollup-plugin-visualizer` (apenas dev, não afeta runtime)

**Fase 2 — Configurar `vite.config.ts` temporariamente**
- Adicionar `visualizer({ filename: 'dist/stats.html', gzipSize: true, brotliSize: true, template: 'treemap' })` ao array de plugins
- Manter `componentTagger` e demais configs intactos

**Fase 3 — Rodar build**
- `npm run build` (timeout ~300s)
- Capturar output: tamanhos de cada chunk (raw / gzip / brotli)

**Fase 4 — Analisar `dist/`**
- `ls -lah dist/assets/` para ranking de chunks por tamanho
- Identificar:
  - Chunk inicial (entry) — alvo: < 100 KB gzip
  - Chunks lazy maiores que 50 KB gzip
  - Possível vazamento de `Admin.tsx` ou `admin/*` no bundle público
  - Duplicação de libs (mesma dep em múltiplos chunks)

**Fase 5 — Gerar relatório**
- Copiar `dist/stats.html` para `/mnt/documents/bundle-stats.html` para o usuário inspecionar
- Listar top 10 chunks por tamanho gzip em formato tabela
- Recomendações concretas baseadas nos achados (ex.: "split X em chunk próprio", "lazy-load Y")

**Fase 6 — Cleanup (opcional)**
- Remover `rollup-plugin-visualizer` do `vite.config.ts` se o usuário não quiser manter (manter como devDep não custa nada em produção)

### Saída esperada
- Arquivo `bundle-stats.html` interativo (treemap navegável) em `/mnt/documents/`
- Tabela markdown com top chunks
- Lista priorizada de otimizações acionáveis (ou confirmação de que está tudo ok)

### Risco
Baixo. Visualizer é dev-only. `vite.config.ts` pode ser revertido facilmente.

### Arquivos modificados
- `package.json` + `package-lock.json` (nova devDep)
- `vite.config.ts` (1 import + 1 plugin)
- `/mnt/documents/bundle-stats.html` (novo artifact)
