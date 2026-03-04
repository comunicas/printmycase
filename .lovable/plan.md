

# Animação suave de transição ao trocar filtros

## Problema atual
Quando o usuário troca de filtro no carrossel, a mudança no preview do celular é instantânea — sem transição visual. Isso causa um "salto" abrupto.

## Solução

Adicionar `transition: filter 0.3s ease` na camada de imagem do `PhonePreview`, para que ao trocar de filtro (ou ajustar brilho/contraste), a mudança seja suave e animada.

### Arquivo afetado

**`src/components/PhonePreview.tsx`** — adicionar `transition: "filter 0.3s ease"` no objeto `imageLayerStyle` (linha ~78), para que a propriedade CSS `filter` anime suavemente entre valores.

Mudança mínima: uma única linha adicionada ao style object.

