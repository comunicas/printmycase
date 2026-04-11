import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { AiFilter } from "@/lib/customize-types";

interface FilterConfirmDialogProps {
  filter: AiFilter | null;
  balance: number;
  cost: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const FilterConfirmDialog = ({
  filter,
  balance,
  cost,
  open,
  onOpenChange,
  onConfirm,
}: FilterConfirmDialogProps) => {
  const hasEnough = balance >= cost;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader className="items-center text-center">
          {filter?.style_image_url && (
            <img
              src={filter.style_image_url}
              alt={filter?.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-primary/20"
            />
          )}
          <DialogTitle className="text-base">Aplicar filtro</DialogTitle>
          <DialogDescription className="text-sm">
            <span className="font-medium text-foreground">{filter?.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-1 text-sm font-medium py-1">
          <span>🪙 {cost}</span>
          <span className="text-muted-foreground">moedas</span>
        </div>

        <p className="text-[11px] text-muted-foreground text-center">Imagens por IA podem variar. Revise antes de finalizar.</p>

        {!hasEnough ? (
          <div className="text-center space-y-2">
            <p className="text-sm text-destructive font-medium">Saldo insuficiente</p>
            <Button asChild size="sm" className="w-full">
              <Link to="/coins">Comprar moedas</Link>
            </Button>
          </div>
        ) : (
          <DialogFooter className="flex-row gap-2 sm:flex-row">
            <DialogClose asChild>
              <Button variant="outline" size="sm" className="flex-1">
                Cancelar
              </Button>
            </DialogClose>
            <Button size="sm" className="flex-1" onClick={onConfirm}>
              Aplicar filtro
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FilterConfirmDialog;
