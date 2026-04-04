

## Fix: StoreLocator Invisível na Landing Page

### Problema Encontrado

O componente `StoreLocator` está no DOM (section[5] dentro de `main`) com o heading "Lojas PrintMyCase — Capinhas Personalizadas em 12 Shopping Centers", mas tem `offsetHeight: 0`. Os dados carregam corretamente (12 lojas, status 200), porém a seção fica invisível.

**Causa raiz**: O componente `ScrollReveal` usa `IntersectionObserver` com `threshold: 0.15`. O conteúdo começa com `opacity: 0` e `translateY(1.5rem)` (classe `sr-hidden`). Como o mapa Leaflet é renderizado dentro de um `ScrollReveal`, e o container do mapa depende de CSS Leaflet para ter altura, há um ciclo: o `ScrollReveal` mantém o conteúdo invisível esperando ele entrar na viewport, mas o conteúdo nunca aparece porque está invisível.

### Solução

**1 arquivo editado: `src/components/StoreLocator.tsx`**

Remover os wrappers `ScrollReveal` de dentro do `StoreLocator`. O mapa Leaflet não funciona bem com animações de entrada porque precisa calcular dimensões no momento da renderização. A seção já fica posicionada entre blocos que têm suas próprias animações.

Alternativa: manter o `ScrollReveal` apenas no título/subtítulo e remover do bloco do grid (mapa + lista), para que o mapa renderize imediatamente com dimensões corretas.

```tsx
// Título com ScrollReveal (ok - é só texto)
<ScrollReveal>
  <h2>...</h2>
  <p>...</p>
</ScrollReveal>

// Grid sem ScrollReveal (mapa precisa de dimensões imediatas)
<div className="grid md:grid-cols-2 gap-6">
  {/* Map */}
  <div className="relative rounded-2xl overflow-hidden shadow-sm h-[400px] md:h-[500px]">
    {allBounds && <MapContainer ... />}
  </div>
  {/* Store List */}
  <div>...</div>
</div>
```

### Teste Admin (já verificado)
- CRUD de lojas funciona (toast "Loja atualizada" confirmado)
- Campos Instagram URL e Slug SEO estão disponíveis no dialog
- Geocodificação via Nominatim funciona

### Após o fix, verificar
- Mapa aparece visível na landing page
- Pins roxos renderizam corretamente
- Clique em loja destaca pin e card
- Layout mobile (mapa em cima, lista embaixo)
- Botão "Como Chegar" abre Waze

