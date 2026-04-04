

## Ajustes no StoreLocator: Manter Todos os Pins Visíveis

### Resultado do Teste

- Pins roxos renderizam corretamente no mapa CartoDB clean
- Clicar em um card destaca o card (borda roxa) e faz flyTo no mapa com o pin ampliado
- Layout mobile funciona (mapa em cima, lista embaixo)
- **Problema encontrado**: ao selecionar uma loja, `flyTo(position, 15)` faz zoom excessivo, mostrando apenas 1 pin. O usuario quer todos os pins visiveis
- **Problema encontrado**: zoom inicial (10) centrado em SP nao mostra as 2 lojas de MG (Patos de Minas e Varginha)

### Plano de Correção

**1 arquivo editado: `src/components/StoreLocator.tsx`**

**Ajuste 1 — Zoom inicial mostrando todos os pins:**
- Remover `center` e `zoom` fixos do `MapContainer`
- Usar `bounds` calculado com `L.latLngBounds(stores.map(s => s.position)).pad(0.1)` para que o mapa inicie mostrando todas as 11 lojas (SP + MG)

**Ajuste 2 — Ao selecionar loja, destacar pin mas NÃO fazer flyTo zoom 15:**
- No `FlyToStore`, em vez de `map.flyTo(position, 15)`, usar `map.flyTo(position, 13)` com zoom mais moderado, OU melhor: fazer `map.flyTo(position, 12)` para manter contexto das lojas vizinhas
- Alternativa preferida: usar `map.setView(position, 13)` sem animação agressiva, mantendo mais contexto geográfico

**Ajuste 3 — Botão "Ver todas as lojas" para resetar zoom:**
- Adicionar um pequeno botão/link "Ver todas" abaixo do titulo ou no canto do mapa que reseta o zoom para os bounds iniciais com todas as lojas

### Detalhes técnicos

```tsx
// Calcular bounds de todas as lojas
const allBounds = L.latLngBounds(stores.map(s => s.position)).pad(0.1);

// MapContainer com bounds em vez de center/zoom
<MapContainer bounds={allBounds} scrollWheelZoom={false} ...>

// FlyToStore com zoom moderado
if (position) map.flyTo(position, 13, { duration: 0.8 });
```

