import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert, AlertCircle } from "lucide-react";

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

const rules = [
  "Marcas e logotipos só podem ser usados se forem da sua empresa.",
  "Não use famosos, times, filmes, séries, músicas ou obras protegidas.",
  "Não envie conteúdo ofensivo, violento ou discriminatório.",
];

const TermsDialog = ({ open, onOpenChange, onAccept }: TermsDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary" />
          Termos de uso da imagem
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-2">
        <ul className="space-y-2">
          {rules.map((rule) => (
            <li key={rule} className="flex items-start gap-2 text-sm text-foreground">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
              <span>{rule}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            Você é responsável pela arte enviada. Personalizações fora das regras
            podem ser canceladas automaticamente.
          </p>
        </div>
      </div>

      <DialogFooter className="gap-2 sm:gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={onAccept}>
          Entendi e continuar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default TermsDialog;
