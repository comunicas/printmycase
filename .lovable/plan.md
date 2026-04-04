

## Geocodificação Automática das Lojas

### Abordagem

Usar a API gratuita **Nominatim (OpenStreetMap)** para converter endereços em coordenadas precisas. Sem API key, sem custo.

**Endpoint:** `https://nominatim.openstreetmap.org/search?q={endereço}&format=json&limit=1`

### Implementação

**1. Botão "Buscar Coordenadas" no StoresManager (`src/components/admin/StoresManager.tsx`)**

- Adicionar um botão ao lado dos campos Lat/Lng no dialog de criação/edição
- Ao clicar, faz fetch no Nominatim com o endereço preenchido
- Preenche automaticamente os campos `lat` e `lng` com o resultado
- Mostra toast de erro se não encontrar o endereço

**2. Geocodificar lojas existentes (script one-shot)**

- Criar um script temporário que busca todas as lojas no banco, geocodifica cada uma via Nominatim (respeitando rate limit de 1 req/s), e atualiza as coordenadas via migration

### Detalhes técnicos

```tsx
// No dialog do StoresManager
const geocode = async () => {
  if (!address.trim()) return;
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?` +
    `q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=br`
  );
  const data = await res.json();
  if (data.length > 0) {
    setLat(data[0].lat);
    setLng(data[0].lon);
    toast({ title: "Coordenadas encontradas" });
  } else {
    toast({ title: "Endereço não encontrado", variant: "destructive" });
  }
};
```

### Limitações do Nominatim
- Rate limit: 1 request por segundo (suficiente para uso admin)
- Precisão: boa para endereços comerciais/shoppings no Brasil
- Sem custo, sem cadastro

### Alternativas pagas (caso precise mais precisão)
- **Google Geocoding API** — mais precisa, requer API key + billing
- **Mapbox Geocoding** — bom custo-benefício, requer API key gratuita até 100k req/mês

### Recomendação
Nominatim é suficiente para o caso de uso (admin adicionando lojas ocasionalmente). Implementar o botão no dialog + atualizar as 11 lojas existentes.

