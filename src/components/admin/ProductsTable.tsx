import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Power } from "lucide-react";
import type { Product } from "@/lib/types";
import LoadingSpinner from "@/components/ui/loading-spinner";

interface Props {
  products: Product[];
  loading: boolean;
  onEdit: (product: Product) => void;
  onToggleActive: (product: Product) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

const formatCents = (cents: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);

const ProductsTable = ({ products, loading, onEdit, onToggleActive, selectedIds, onSelectionChange }: Props) => {
  if (loading) {
    return <LoadingSpinner />;
  }

  if (products.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Nenhum produto cadastrado ainda.
      </p>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <input
                type="checkbox"
                checked={products.length > 0 && selectedIds.size === products.length}
                onChange={(e) => {
                  onSelectionChange(e.target.checked ? new Set(products.map((p) => p.id)) : new Set());
                }}
                className="accent-primary h-4 w-4"
              />
            </TableHead>
            <TableHead className="w-16">Img</TableHead>
            <TableHead>Nome</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Stripe</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <input
                  type="checkbox"
                  checked={selectedIds.has(p.id)}
                  onChange={(e) => {
                    const next = new Set(selectedIds);
                    e.target.checked ? next.add(p.id) : next.delete(p.id);
                    onSelectionChange(next);
                  }}
                  className="accent-primary h-4 w-4"
                />
              </TableCell>
              <TableCell>
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.name} className="h-10 w-10 rounded object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded bg-muted" />
                )}
              </TableCell>
              <TableCell className="font-medium">{p.name}</TableCell>
              <TableCell className="text-muted-foreground text-xs">{p.slug}</TableCell>
              <TableCell>{formatCents(p.price_cents)}</TableCell>
              <TableCell>
                {p.stripe_product_id ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-800">Sincronizado</span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">Pendente</span>
                )}
              </TableCell>
              <TableCell>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                  {p.active ? "Ativo" : "Inativo"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => onEdit(p)} title="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => onToggleActive(p)} title={p.active ? "Desativar" : "Ativar"}>
                    <Power className={`h-4 w-4 ${p.active ? "text-green-600" : "text-red-500"}`} />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsTable;
