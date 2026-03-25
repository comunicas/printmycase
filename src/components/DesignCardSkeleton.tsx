import { Card, CardContent } from "@/components/ui/card";

const DesignCardSkeleton = () => (
  <Card className="overflow-hidden border-0 shadow-sm">
    <div className="aspect-square bg-muted animate-pulse" />
    <CardContent className="p-2.5 space-y-1.5">
      <div className="h-3.5 bg-muted animate-pulse rounded w-full" />
      <div className="h-3.5 bg-muted animate-pulse rounded w-2/3" />
      <div className="h-6 bg-muted animate-pulse rounded-md w-20 mt-1" />
    </CardContent>
  </Card>
);

export default DesignCardSkeleton;
