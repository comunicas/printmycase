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
    <DialogContent className="inset-0 flex h-[100dvh] w-screen max-w-none flex-col gap-0 overflow-hidden rounded-none border-0 p-0 sm:left-0 sm:top-0 sm:h-[100dvh] sm:max-h-none sm:max-w-none sm:translate-x-0 sm:translate-y-0 sm:rounded-none sm:border-0">
      <DialogHeader className="shrink-0 border-b bg-background/95 px-5 pb-4 pt-5 text-left backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-8 sm:pb-5 sm:pt-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-2">
          <DialogTitle className="flex items-center gap-2.5 pr-12 text-base sm:text-lg">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0 text-primary sm:h-5 sm:w-5" />
            Termos de uso da imagem
          </DialogTitle>
          <DialogDescription className="max-w-2xl text-sm leading-relaxed">
            Antes de enviar, confirme que a arte respeita as regras de uso.
          </DialogDescription>
        </div>
      </DialogHeader>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10">
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            A personalização deve respeitar direitos autorais e regras de conteúdo.
          </p>

          <ul className="space-y-3.5" aria-label="Regras para envio de imagem">
            {[
              "Marcas e logotipos só podem ser usados se forem da sua empresa.",
              "Não use famosos, times, filmes, séries, músicas, livros ou qualquer obra protegida.",
              "Não envie conteúdo ofensivo, violento, pornográfico ou discriminatório.",
            ].map((rule) => (
              <li key={rule} className="flex items-start gap-3.5 rounded-md border bg-muted/40 p-4 text-sm leading-relaxed text-foreground sm:p-4.5">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Check className="h-3.5 w-3.5" />
                </span>
                <span className="max-w-2xl">{rule}</span>
              </li>
            ))}
          </ul>

          <div className="max-w-2xl rounded-md border bg-muted/50 p-4 sm:p-5">
            <p className="text-sm font-medium text-foreground">Responsabilidade pelo conteúdo</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Você é responsável pela arte enviada. Personalizações fora das regras podem ser canceladas automaticamente.
            </p>
          </div>
        </div>
      </div>

      <DialogFooter className="shrink-0 border-t bg-background/95 px-5 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-8 sm:py-5 lg:px-10">
        <div className="mx-auto flex w-full max-w-3xl flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button className="w-full sm:min-w-40 sm:w-auto" variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="w-full sm:min-w-52 sm:w-auto" onClick={onAccept}>
            Entendi e continuar
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default TermsDialog;
