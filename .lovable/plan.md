
## Otimizar favicon: 56 KB → ~5 KB

### Problema
`public/favicon.ico` tem 56 KB — provavelmente contém múltiplas resoluções em alta qualidade ou uma única imagem grande. Browsers modernos só precisam de 16/32 px (favicon) e 180 px (Apple touch icon).

### Plano

**Fase 1 — Inspecionar favicon atual**
- Rodar `identify public/favicon.ico` para ver resoluções embutidas
- Confirmar tamanho atual

**Fase 2 — Gerar versões otimizadas**
A partir do `favicon.ico` atual (extraindo o maior frame como source):
- `public/favicon-16.png` (16×16, PNG otimizado) — ~500 B
- `public/favicon-32.png` (32×32, PNG otimizado) — ~1 KB
- `public/apple-touch-icon.png` (180×180, PNG otimizado) — ~3-4 KB
- Novo `public/favicon.ico` contendo apenas 16+32 multi-resolução — ~2 KB

Ferramentas: ImageMagick via nix (`magick convert`) + `pngquant` para compressão lossy de PNG.

**Fase 3 — Atualizar `index.html`**
Adicionar no `<head>`:
```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
<link rel="shortcut icon" href="/favicon.ico" />
```
(Manter `favicon.ico` como fallback para browsers antigos que requisitam `/favicon.ico` automaticamente.)

**Fase 4 — Validar**
- Listar tamanhos finais dos 4 arquivos, confirmar total < 8 KB
- Verificar visualmente o favicon no preview (tab do browser)

### Risco
Baixo. Se a qualidade visual ficar ruim em 16 px, regenerar com `-filter Lanczos` ou ajustar pngquant quality.

### Arquivos modificados
- `public/favicon.ico` (overwrite, menor)
- `public/favicon-16.png` (novo)
- `public/favicon-32.png` (novo)
- `public/apple-touch-icon.png` (novo)
- `index.html` (4 novas tags `<link>` no `<head>`)

### Saída esperada
Total favicon assets: ~5-8 KB (vs 56 KB hoje) — economia de ~50 KB no first paint.
