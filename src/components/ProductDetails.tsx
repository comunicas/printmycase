import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import type { Product } from "@/data/products";

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger value="description" className="flex-1">
          Descrição
        </TabsTrigger>
        <TabsTrigger value="specs" className="flex-1">
          Especificações
        </TabsTrigger>
        <TabsTrigger value="reviews" className="flex-1">
          Avaliações
        </TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="pt-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {product.description}
        </p>
      </TabsContent>

      <TabsContent value="specs" className="pt-4">
        <Table>
          <TableBody>
            {product.specs.map((spec) => (
              <TableRow key={spec.label}>
                <TableCell className="font-medium text-foreground w-1/3">
                  {spec.label}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {spec.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="reviews" className="pt-4">
        <p className="text-sm text-muted-foreground">
          {product.reviewCount} avaliações • Média de {product.rating.toFixed(1)} estrelas
        </p>
        <p className="text-sm text-muted-foreground mt-2 italic">
          Em breve: avaliações de clientes.
        </p>
      </TabsContent>
    </Tabs>
  );
};

export default ProductDetails;
