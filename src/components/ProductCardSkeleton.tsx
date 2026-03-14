import { Card, CardContent } from "@/components/ui/card";

const ProductCardSkeleton = () => (
  <Card className="overflow-hidden">
    <div className="aspect-square bg-muted animate-pulse" />
    <CardContent className="p-2.5 space-y-2">
      <div className="space-y-1.5">
        <div className="h-3.5 bg-muted animate-pulse rounded w-full" />
        <div className="h-3.5 bg-muted animate-pulse rounded w-2/3" />
      </div>
      <div className="h-6 bg-muted animate-pulse rounded-md w-20" />
      <div className="h-8 bg-muted animate-pulse rounded-md w-full" />
    </CardContent>
  </Card>
);

export default ProductCardSkeleton;
