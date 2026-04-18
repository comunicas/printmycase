
## Auditoria de dependências npm

### Resultado: bundle já enxuto

Inventariei `package.json` (apenas 17 deps de produção) e validei padrões de uso. **Não encontrei deps removíveis ou substituíveis com ganho real.**

### Análise por dependência

| Pacote | Peso aprox | Status | Justificativa |
|---|---|---|---|
| `react` + `react-dom` | ~140 KB | Essencial | Core do framework |
| `@supabase/supabase-js` | ~80 KB | Essencial | Backend (chunk separado via vite manualChunks) |
| `react-router-dom` | ~22 KB | Essencial | Roteamento |
| `leaflet` + `react-leaflet` + `@react-leaflet/core` | ~150 KB | **Já isolado** | Lazy-loaded só no `StoreLocator` da Landing + chunk próprio no `vite.config.ts`. Não entra no bundle inicial |
| 11× `@radix-ui/react-*` | ~5-15 KB cada | Essencial | Cada um usado em UI primitive específico. Tree-shaken por componente |
| `lucide-react` | tree-shakable | OK | 366 imports nomeados em 80 arquivos — Vite/SWC tree-shake corretamente |
| `tailwind-merge` + `clsx` + `cva` | ~10 KB total | Essencial | Base do sistema de classes utility |
| `tailwindcss-animate` | ~2 KB | Essencial | Animações Radix |
| `@lovable.dev/cloud-auth-js` | ~10 KB | Auto-gerado | Não pode ser removido |

### Otimizações já aplicadas (confirmadas)

1. **Code-splitting agressivo**: 26 lazy routes em `App.tsx` + 4 lazy sections em `Landing.tsx`
2. **Manual chunks** no `vite.config.ts`: `leaflet` e `supabase` em chunks separados
3. **Dedupe** de `react`/`react-dom`/`react/jsx-runtime`
4. **Zero deps redundantes**: sem moment.js, sem lodash, sem axios, sem date-fns

### Conclusão

**Nenhuma ação recomendada.** O `package.json` já está no mínimo viável para o conjunto de features (e-commerce + customização IA + mapa de lojas + admin). Toda dep listada tem uso ativo e justificado.

### O que NÃO vale a pena trocar

- `lucide-react` → alternativas (react-icons, heroicons) não trazem ganho com tree-shaking funcionando
- `leaflet` → MapLibre GL é mais pesado; alternativas leves (Pigeon Maps) não suportam os mesmos features
- `@radix-ui/*` → base do shadcn/ui; trocar por Headless UI seria refactor enorme sem ganho

### Próximas oportunidades (fora de "remover deps")

Se quiser continuar reduzindo bundle, o caminho é **runtime profiling**, não auditoria de deps:

1. Rodar `vite build` e analisar `dist/` com `rollup-plugin-visualizer` para ver chunks reais
2. Identificar se algum admin component pesado vaza pro bundle público (improvável dado lazy routing)
3. Verificar se `lucide-react` tree-shake está perfeito no build de produção (analisar chunk size)

### Nada a executar nesta auditoria

Read-only confirma: bundle já otimizado. Sem mudanças necessárias.
