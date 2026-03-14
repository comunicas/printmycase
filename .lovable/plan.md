

## Botão laranja no Hero + cores complementares no "Como funciona"

### Alterações

| Arquivo | Mudança |
|---|---|
| `src/pages/Landing.tsx` | Botão principal do Hero: adicionar classes `bg-orange-500 hover:bg-orange-600 text-white` e trocar `glow-primary` por `glow-orange` (shadow laranja) |
| `src/pages/Landing.tsx` | Seção "Como funciona": cada step recebe um gradiente de cor diferente no ícone circular — Step 1: roxo→violeta (primary), Step 2: laranja→amber, Step 3: emerald→teal. O badge numérico acompanha a cor do respectivo step. A seta/chevron entre steps ganha cor correspondente. |
| `src/index.css` | Adicionar classe `.glow-orange` com box-shadow laranja (`hsl(25 95% 53%)`) |

### Detalhes visuais

**Hero CTA:**
```
bg-orange-500 hover:bg-orange-600 text-white shadow glow-orange
```

**Como funciona — cores por step:**
- Step 1 (Encontre): `from-primary to-primary/70` (roxo, mantém atual)
- Step 2 (Personalize): `from-orange-500 to-amber-500`
- Step 3 (Receba): `from-emerald-500 to-teal-500`

Cada ícone e badge numérico usa o gradiente do seu step. As setas (chevron) entre steps usam a cor do step anterior com opacidade reduzida.

