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

interface UpscaleConfirmDialogProps {
  balance: number;
  cost: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

import { forwardRef } from "react";

const UpscaleConfirmDialog = forwardRef<HTMLDivElement, UpscaleConfirmDialogProps>(({
  balance,
  cost,
  open,
  onOpenChange,
  onConfirm,
}, _ref) => {
  const hasEnough = balance >= cost;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xs">
        <DialogHeader className="items-center text-center">
          <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl">
            ✨
          </div>
          <DialogTitle className="text-base">Upscale IA</DialogTitle>
          <DialogDescription className="text-sm">
            Aumentar resolução em 4x usando inteligência artificial
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
              Aplicar upscale
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
});

UpscaleConfirmDialog.displayName = "UpscaleConfirmDialog";

export default UpscaleConfirmDialog;
