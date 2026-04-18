
## Auditoria de imagens em /public/lovable-uploads/

### Achados

| Arquivo | Tamanho | Dimensão | Uso real | Status |
|---|---|---|---|---|
| `ai-showcase-[1-5].png` | ~2.6 MB cada (~13 MB total) | 1920x1920 | **NENHUM** | 🔴 Órfão |
| `ai-showcase-[1-5].webp` | ~1.1 MB cada (~5.9 MB total) | 1024x1024 | **NENHUM** (só `-sm` é usado) | 🔴 Órfão |
| `ai-showcase-[1-5]-sm.webp` | ~6-16 KB | 352x352 | AiCoinsSection ✅ | OK (já otimizados) |
| `logo-printmycase.png` | 236 KB | 800x800 | **NENHUM** (usa `/logo-printmycase-sm.webp` na raiz) | 🔴 Órfão |
| `stripe-logo.png` | 63 KB | 1920x799 | **NENHUM** | 🔴 Órfão |
| `stripe-logo.webp` | 34 KB | 1920x799 | **NENHUM** (só `-sm` é usado em PaymentBadges) | 🔴 Órfão |
| `stripe-logo-sm.webp` | 3.7 KB | 240x100 | PaymentBadges ✅ | OK |
| `4824363f-...png` | 134 KB | 757x364 | **NENHUM** | 🔴 Órfão |
| `79379ce7-...png` | 55 KB | 728x157 | **NENHUM** (já existe `.webp`, e nem o webp é usado) | 🔴 Órfão |
| `79379ce7-...webp` | 18 KB | 728x157 | **NENHUM** | 🔴 Órfão |

### Conclusão

**Nenhuma imagem em `/public/lovable-uploads/` está superdimensionada na produção** — todos os arquivos efetivamente servidos (`-sm.webp`) já estão otimizados. Porém há **~19 MB em arquivos órfãos** no bundle de deploy que aumentam o tamanho do repo e do upload mas **NÃO impactam performance do usuário** (não são baixados, não estão referenciados em código nem HTML).

### Plano de ação

**Deletar 13 arquivos órfãos** (PNGs originais e WebPs grandes mantidos como "fonte" mas não usados):

- `ai-showcase-1.png`, `ai-showcase-2.png`, `ai-showcase-3.png`, `ai-showcase-4.png`, `ai-showcase-5.png`
- `ai-showcase-1.webp`, `ai-showcase-2.webp`, `ai-showcase-3.webp`, `ai-showcase-4.webp`, `ai-showcase-5.webp`
- `logo-printmycase.png` (versão grande não usada — a `-sm.webp` na raiz `/public/` é a usada)
- `stripe-logo.png`, `stripe-logo.webp`
- `4824363f-6c57-4e39-a449-04a7c58c4a1a.png`
- `79379ce7-c6b3-4051-9947-c8dfc449251d.png`, `79379ce7-c6b3-4051-9947-c8dfc449251d.webp`

**Ganho**: ~19 MB no repositório / deploy bundle. **Zero impacto de runtime** (nenhum usuário baixa esses arquivos hoje).

### Riscos

- Mínimo. Arquivos foram verificados via `grep -rn` em `src/`, `index.html` e `public/` — nenhuma referência encontrada.
- Backup natural: o git histórico preserva os arquivos caso necessário restaurar.

### Importante — não confundir

A versão `logo-printmycase.png` referenciada em `src/pages/Unsubscribe.tsx` aponta para o **bucket Supabase** (`storage/v1/object/public/email-assets/logo-printmycase.png`), não para `/public/lovable-uploads/`. Seguro deletar o local.

### Recomendação

Aprove para eu executar a limpeza. Caso prefira manter os PNGs originais como "fonte mestre" para regenerações futuras, me avise — posso deletar apenas os WebPs grandes intermediários (ai-showcase-[1-5].webp, stripe-logo.webp, 79379ce7.webp), mantendo os PNGs. Ganho ainda seria ~6 MB.
