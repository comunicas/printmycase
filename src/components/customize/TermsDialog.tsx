import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, ShieldAlert } from "lucide-react";

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

const TermsDialog = ({ open, onOpenChange, onAccept }: TermsDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="inset-0 flex h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:left-[50%] sm:top-[50%] sm:h-auto sm:max-h-[90dvh] sm:w-full sm:max-w-md sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:border">
      <DialogHeader className="shrink-0 border-b px-5 pb-4 pt-6 text-left sm:px-6">
        <DialogTitle className="flex items-center gap-2 pr-10 text-base sm:text-lg">
          <ShieldAlert className="h-5 w-5 text-primary" />
          Termos de Uso de Imagem
        </DialogTitle>
        <DialogDescription className="text-sm leading-relaxed">
          Antes de enviar sua imagem, confirme que o conteúdo está dentro das regras.
        </DialogDescription>
      </DialogHeader>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            A personalização precisa respeitar direitos autorais e regras de conteúdo.
          </p>

          <ul className="space-y-3" aria-label="Regras para envio de imagem">
            {[
              "Marcas e logotipos só podem ser usados se forem da sua empresa.",
              "Não use famosos, times, filmes, séries, músicas, livros ou qualquer obra protegida.",
              "Não envie conteúdo ofensivo, violento, pornográfico ou discriminatório.",
            ].map((rule) => (
              <li key={rule} className="flex items-start gap-3 rounded-md border bg-muted/40 p-3 text-sm leading-relaxed text-foreground">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span>{rule}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-md border bg-muted/50 p-4">
            <p className="text-sm font-medium text-foreground">Responsabilidade pelo conteúdo</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Você é responsável pela arte enviada. Personalizações fora das regras podem ser canceladas automaticamente.
            </p>
          </div>
        </div>
      </div>

      <DialogFooter className="shrink-0 border-t px-5 py-4 sm:px-6 sm:gap-2">
        <Button className="w-full sm:w-auto" variant="ghost" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button className="w-full sm:w-auto" onClick={onAccept}>
          Entendi e continuar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default TermsDialog;
