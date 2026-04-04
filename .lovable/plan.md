

## Módulo "Nossas Lojas" com Mapa Interativo na Landing Page

### Visão geral
Criar um componente `StoreLocator` com mapa interativo (Leaflet — gratuito, sem API key) e lista de endereços lado a lado. Ao clicar num pin ou num endereço da lista, o pin fica destacado e o endereço selecionado recebe destaque visual. Será inserido na Landing entre "Depoimentos" e "FAQ".

### Arquivos

**1. Instalar dependência: `leaflet` + `react-leaflet`**
- `npm install leaflet react-leaflet @types/leaflet`

**2. Novo componente: `src/components/StoreLocator.tsx`**
- Array estático com as 11 lojas (nome, endereço, cidade/estado, lat/lng)
- Layout: `grid md:grid-cols-2` — mapa à esquerda, lista à direita
- Mapa usa `react-leaflet` com tiles do OpenStreetMap (gratuito)
- Cada loja tem um `Marker`; ao clicar, `selectedStore` é atualizado via `useState`
- Pin selecionado usa ícone diferente (cor primária/laranja)
- Lista de lojas agrupada por estado (SP, MG) com scroll vertical (`max-h-[500px] overflow-y-auto`)
- Card da loja selecionada recebe borda/bg destacado
- Clicar num card da lista faz `flyTo` no mapa para o pin correspondente
- Responsivo: no mobile, mapa em cima e lista embaixo (stack vertical)
- Envolvido em `ScrollReveal` para animação de entrada

**3. Editar: `src/pages/Landing.tsx`**
- Importar `StoreLocator`
- Inserir `<StoreLocator />` entre a seção de depoimentos e `<FaqSection />`

### Coordenadas das lojas (aproximadas)

| Loja | Lat | Lng |
|------|-----|-----|
| Shopping Center 3 | -23.5558 | -46.6621 |
| Mooca Plaza | -23.5732 | -46.5928 |
| Shopping Taboão | -23.6265 | -46.7588 |
| Internacional Guarulhos | -23.4656 | -46.5322 |
| Boulevard Tatuapé | -23.5362 | -46.5764 |
| Metrô Tatuapé | -23.5405 | -46.5753 |
| Metrô Tucuruvi | -23.4793 | -46.6027 |
| Shopping Bourbon | -23.5276 | -46.6802 |
| Tietê Plaza | -23.4859 | -46.7267 |
| Pátio Central (Patos de Minas) | -18.5881 | -46.5181 |
| Via Café (Varginha) | -21.5610 | -45.4357 |

### Design
- Título: "Encontre uma Loja PrintMyCase"
- Subtítulo: "Visite uma de nossas lojas físicas"
- Mapa: altura fixa 500px, cantos arredondados, sombra suave
- Lista: cards com ícone MapPin, nome da loja em negrito, endereço em texto secundário
- Seleção: card com `ring-2 ring-primary bg-primary/5`, pin com cor laranja/primária
- Agrupamento por estado com label cinza (`text-muted-foreground font-semibold`)

