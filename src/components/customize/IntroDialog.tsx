import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Move, Sparkles, Image, ShoppingCart, ChevronLeft, ChevronRight } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Envie sua imagem",
    description: "Faça upload ou tire uma foto direto do celular",
  },
  {
    icon: Move,
    title: "Ajuste posição e tamanho",
    description: "Arraste, redimensione e rotacione livremente",
  },
  {
    icon: Sparkles,
    title: "Aplique Filtros IA",
    description: "Transforme sua imagem com estilos artísticos",
  },
  {
    icon: Image,
    title: "Escolha da Galeria",
    description: "Use uma imagem pronta da nossa galeria",
  },
  {
    icon: ShoppingCart,
    title: "Finalize a compra",
    description: "Clique em Continuar para concluir seu pedido",
  },
];

interface IntroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const IntroDialog = ({ open, onOpenChange }: IntroDialogProps) => {
  const [step, setStep] = useState(0);

  const handleClose = () => {
    localStorage.setItem("customize_intro_seen", "true");
    setStep(0);
    onOpenChange(false);
  };

  const isLast = step === steps.length - 1;
  const current = steps[step];
  const Icon = current.icon;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="max-w-xs p-0 gap-0 rounded-2xl overflow-hidden">
        <div className="flex flex-col items-center text-center px-6 pt-8 pb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">{current.title}</h3>
          <p className="text-sm text-muted-foreground">{current.description}</p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => setStep(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? "bg-primary w-4" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-4 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStep(step - 1)}
            disabled={step === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </Button>

          {isLast ? (
            <Button size="sm" onClick={handleClose}>
              Entendi!
            </Button>
          ) : (
            <Button size="sm" onClick={() => setStep(step + 1)} className="gap-1">
              Próximo <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IntroDialog;
