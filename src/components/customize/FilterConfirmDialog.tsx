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

const FILTER_DESCRIPTIONS: Record<string, string> = {
  "3d mascot": "Transforma sua foto em um mascote 3D animado, estilo Pixar.",
  "pixel art": "Converte a imagem em arte de pixels coloridos, estilo retrô 8-bit.",
  "foto realista": "Refina a foto para um visual realista, com mais nitidez e textura natural.",
  "desenho": "Reimagina sua foto como um desenho a lápis em preto e branco.",
  "street toy": "Recria as pessoas como bonecos colecionáveis em estilo street/urbano.",
  "character pop": "Estiliza como personagem de animação pop, com cores vibrantes.",
  "posicionar": "Reposiciona o conteúdo da imagem para enquadrar melhor na capinha.",
  "+qualidade": "Aumenta a resolução e nitidez da imagem usando IA (upscale).",
};

const FALLBACK_DESCRIPTION = "Aplica o estilo selecionado à sua imagem usando IA.";

const getDescription = (name?: string | null) => {
  if (!name) return FALLBACK_DESCRIPTION;
  return FILTER_DESCRIPTIONS[name.trim().toLowerCase()] ?? FALLBACK_DESCRIPTION;
};

const FilterConfirmDialog = ({
  filter,
  balance,
  cost,
  open,
  onOpenChange,
  onConfirm,
}: FilterConfirmDialogProps) => {
  const hasEnough = balance >= cost;
  const description = getDescription(filter?.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm gap-3 pb-0">
        <DialogHeader className="items-center text-center gap-2">
          {filter?.style_image_url && (
            <img
              src={filter.style_image_url}
              alt={filter?.name}
              className="w-24 h-24 rounded-2xl object-cover border border-border shadow-sm"
            />
          )}
          <DialogTitle className="text-base">Aplicar filtro</DialogTitle>
          <DialogDescription asChild>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-foreground">{filter?.name}</p>
              <p className="text-sm text-muted-foreground leading-snug">
                {description}
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-1 text-sm font-medium">
          <span>🪙 {cost}</span>
          <span className="text-muted-foreground">moedas</span>
        </div>

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

        <p className="text-[10px] text-muted-foreground/60 text-center border-t border-border/60 -mx-6 px-6 pt-2 pb-3 mt-2">
          Imagens por IA podem variar. Revise antes de finalizar.
        </p>
      </DialogContent>
    </Dialog>
  );
};

export default FilterConfirmDialog;
