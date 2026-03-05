

## Plan: Remove "Avaliações" tab from Product Details

Remove the "Avaliações" (Reviews) tab from the `ProductDetails` component, keeping only "Descrição" and "Especificações".

### Changes

**`src/components/ProductDetails.tsx`**:
- Remove the `TabsTrigger` for "reviews"
- Remove the `TabsContent` for "reviews"

Single file, ~10 lines removed.

