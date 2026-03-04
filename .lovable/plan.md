

# Filtros por Marca + Paginacao no Catalogo

## Contexto

73 produtos ativos. Marcas extraidas do nome: Samsung (33), Apple (26), Xiaomi (7), Motorola (4). Nao existe coluna de marca — sera extraida client-side pelo prefixo do nome.

## Plano

### 1. Logica de filtragem e paginacao — `src/hooks/useProducts.ts`

- Adicionar parametros opcionais ao hook: `brand?: string`
- Extrair marca do nome do produto client-side com funcao utilitaria (`extractBrand`)
- Nao adicionar coluna ao banco (desnecessario com 73 produtos — tudo cabe em uma query)
- Retornar todos os produtos e filtrar client-side
- Adicionar paginacao client-side: `page`, `pageSize` (ex: 12 por pagina), retornar `totalPages`

### 2. Barra de filtros — `src/pages/Catalog.tsx`

- Adicionar chips/botoes horizontais: "Todos", "Apple", "Samsung", "Motorola", "Xiaomi"
- Estado local `selectedBrand` e `currentPage`
- Filtrar produtos pelo brand selecionado
- Paginar o resultado filtrado (12 por pagina)
- Mostrar controles de paginacao (anterior/proximo + indicador de pagina)
- Atualizar contador: "{n} capas disponíveis"

### 3. Funcao utilitaria — `src/lib/utils.ts`

Adicionar `extractBrand(productName: string)`:
- "Capa iPhone..." → "Apple"
- "Capa Galaxy..." → "Samsung"
- "Capa Moto..." → "Motorola"
- "Capa Redmi/Poco/Xiaomi..." → "Xiaomi"

## Arquivos afetados

| Arquivo | Mudanca |
|---------|---------|
| `src/lib/utils.ts` | Adicionar `extractBrand()` |
| `src/pages/Catalog.tsx` | Filtros por marca + paginacao |

