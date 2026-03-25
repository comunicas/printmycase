import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ImageIcon } from "lucide-react";
import type { Collection } from "@/hooks/useCollections";

interface CollectionCardProps {
  collection: Collection;
}

const CollectionCard = ({ collection }: CollectionCardProps) => (
  <Link to={`/colecao/${collection.slug}`} className="group block">
    <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center">
        {collection.cover_image ? (
          <img
            src={collection.cover_image}
            alt={collection.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            width="300"
            height="300"
          />
        ) : (
          <ImageIcon className="w-10 h-10 text-muted-foreground" />
        )}
      </div>
      <CardContent className="p-2.5">
        <h3 className="text-[13px] font-semibold text-foreground line-clamp-2 leading-tight">
          {collection.name}
        </h3>
      </CardContent>
    </Card>
  </Link>
);

export default CollectionCard;
