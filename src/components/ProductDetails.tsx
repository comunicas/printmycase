import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import type { Product } from "@/lib/types";

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails = React.forwardRef<HTMLDivElement, ProductDetailsProps>(
  ({ product }, ref) => {
    return (
      <div ref={ref}>
        <Tabs defaultValue="description" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="description" className="flex-1">
              Descrição
            </TabsTrigger>
            <TabsTrigger value="specs" className="flex-1">
              Especificações
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
        </Tabs>
      </div>
    );
  }
);
ProductDetails.displayName = "ProductDetails";

export default ProductDetails;
