import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  description?: string;
  destructive?: boolean;
}

const ConfirmDialog = ({ open, onConfirm, onCancel, title, description, destructive }: ConfirmDialogProps) => (
  <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
    <DialogContent className="max-w-sm">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button variant={destructive ? "destructive" : "default"} onClick={onConfirm}>
          Confirmar
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ConfirmDialog;
