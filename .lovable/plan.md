

## Ajustes no StoreLocator: UX clean, pins roxos, reposicionar

### Mudanças

**1. Reposicionar na Landing (`src/pages/Landing.tsx`)**
- Mover `<StoreLocator />` de depois dos Depoimentos para logo depois de `<AiCoinsSection />` (após linha 223, antes de `<WhyPrintMyCase />`)

**2. Redesign do componente (`src/components/StoreLocator.tsx`)**

**Pins roxos da marca** — trocar os ícones Leaflet padrão por SVG markers customizados inline usando `L.divIcon` com cor `hsl(265, 83%, 57%)` (a primary da marca). O pin ativo fica com opacidade/escala maior. Isso elimina dependência de URLs externas para ícones.

**Mapa clean** — usar tile layer com estilo mais limpo: `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png` (CartoDB Positron — gratuito, sem API key, visual minimalista cinza claro)

**UX alinhada com o resto da landing:**
- Fundo `bg-background` em vez de `bg-muted/30` (consistente com as outras seções)
- Remover emoji 📍 dos labels de estado, usar apenas texto com `text-xs uppercase tracking-wider` (mais clean)
- Cards de loja mais compactos: padding `p-2.5`, fonte menor
- Mapa com `rounded-2xl` e sombra suave (`shadow-sm`)
- Seção com `py-16` mantido

**3. Resultado visual**

```text
┌─ Seção "Encontre uma Loja" ──────────────────────────┐
│                                                       │
│  ┌── Mapa CartoDB clean ──┐  ┌── Lista scroll ─────┐ │
│  │                        │  │ SÃO PAULO (SP)      │ │
│  │   🟣 🟣               │  │ ┌ Shopping Center 3 ┐│ │
│  │      🟣   🟣          │  │ │ Av. Paulista...   ││ │
│  │   🟣                  │  │ └───────────────────┘│ │
│  │                        │  │ ┌ Mooca Plaza      ┐│ │
│  │                        │  │ │ Rua Cap. Pach... ││ │
│  └────────────────────────┘  │ └───────────────────┘│ │
│                               │ ...                  │ │
│                               └─────────────────────┘ │
└───────────────────────────────────────────────────────┘
```

### Detalhes técnicos
- `L.divIcon` com SVG inline: círculo roxo com borda branca (12px) — sem dependência externa
- Pin ativo: escala 1.3x + sombra glow roxa
- Tile: CartoDB Positron (`cartocdn.com/light_all`) — sem chave, atribuição OSM mantida
- Nenhuma dependência nova

