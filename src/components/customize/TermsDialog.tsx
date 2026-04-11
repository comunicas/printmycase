import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

interface TermsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAccept: () => void;
}

const TermsDialog = ({ open, onOpenChange, onAccept }: TermsDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="sm:max-w-md max-h-[90dvh] overflow-y-auto place-content-center gap-3">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-primary" />
          Termos de Uso de Imagem
        </DialogTitle>
        <DialogDescription>
          Leia e aceite os termos antes de enviar sua imagem.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
        <p>
          O uso de nomes de marcas ou logomarca somente são permitidos se forem
          da sua empresa.
        </p>
        <p>
          Não é permitido o uso de imagens ou nome de famosos, jogadores, séries,
          filmes, times e/ou partes de músicas e livros, pois todos possuem
          direitos autorais não pertencentes a nós e/ou você.
        </p>
        <p>
          Conteúdos de caráter religioso, violento, pornográfico e/ou
          preconceituoso não são permitidos.
        </p>
        <p className="font-semibold text-foreground">
          IMPORTANTE: Caso a sua customização descumpra alguma das regras acima,
          o item poderá ser cancelado automaticamente. Lembre-se, a estampa
          produzida é de sua autoria e você tem total responsabilidade sobre ela.
          Caso a regra seja quebrada o envio da case cancelada ficará por sua
          responsabilidade.
        </p>
      </div>

      <DialogFooter className="gap-2 sm:gap-0">
        <Button variant="ghost" onClick={() => onOpenChange(false)}>
          Cancelar
        </Button>
        <Button onClick={onAccept}>Li e aceito os termos</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default TermsDialog;
