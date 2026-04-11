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
import { ZoomIn } from "lucide-react";

interface LowResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resolution: { w: number; h: number } | null;
  onUpscale: () => void;
  hasUpscaleFilter: boolean;
}

const LowResolutionDialog = ({
  open,
  onOpenChange,
  resolution,
  onUpscale,
  hasUpscaleFilter,
}: LowResolutionDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-xs place-content-center gap-3">
      <DialogHeader className="items-center text-center">
        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
          <ZoomIn className="w-7 h-7 text-primary" />
        </div>
        <DialogTitle className="text-base">Resolução baixa</DialogTitle>
        <DialogDescription className="text-sm">
          Filtros de estilo precisam de no mínimo 256×256px para gerar bons
          resultados. Use o Upscale IA para aumentar a resolução da sua imagem.
        </DialogDescription>
        {resolution && (
          <p className="text-xs text-muted-foreground pt-1">
            Sua imagem: <span className="font-medium text-foreground">{resolution.w}×{resolution.h}px</span>
          </p>
        )}
      </DialogHeader>

      <DialogFooter className="flex-row gap-2 sm:flex-row">
        <DialogClose asChild>
          <Button variant="outline" size="sm" className="flex-1">
            Cancelar
          </Button>
        </DialogClose>
        {hasUpscaleFilter && (
          <Button size="sm" className="flex-1" onClick={onUpscale}>
            ✨ Aplicar Upscale IA
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default LowResolutionDialog;
