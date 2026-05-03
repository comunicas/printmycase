import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OnboardingStep } from "@/hooks/useOnboarding";

interface OnboardingModalProps {
  isOpen: boolean;
  step: OnboardingStep | null;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onSkip: () => void;
}

type StepContent = {
  icon: string;
  title: string;
  description: string;
  cta: string;
};

const STEP_CONTENT: Record<Exclude<OnboardingStep, "done">, StepContent> = {
  upload: {
    icon: "📸",
    title: "Envie sua foto",
    description:
      "Toque na área central da capa para escolher uma foto do seu celular, galeria ou tirar uma foto agora.",
    cta: "Entendi, vou enviar",
  },
  position: {
    icon: "✋",
    title: "Posicione e redimensione",
    description:
      "Arraste a imagem para posicioná-la como preferir. Use o controle de Zoom para ajustar o tamanho. Clique em Expandir para preencher toda a capa.",
    cta: "Ótimo, próximo passo",
  },
  filter: {
    icon: "✨",
    title: "Aplique um Filtro IA",
    description:
      "Transforme sua foto com IA! Escolha entre estilos como Pixel Art, 3D Mascot ou Cyberpunk. O filtro melhora a qualidade e adiciona um estilo único à sua capinha.",
    cta: "Incrível, próximo",
  },
  checkout: {
    icon: "🛍️",
    title: "Finalize seu pedido",
    description:
      "Quando estiver satisfeito com o design, clique em 'Finalizar pedido'. Sua capinha será produzida com impressão UV LED e entregue em todo o Brasil.",
    cta: "Vamos criar minha capinha!",
  },
};

export function OnboardingModal({
  isOpen,
  step,
  stepIndex,
  totalSteps,
  onNext,
  onSkip,
}: OnboardingModalProps) {
  if (!step || step === "done") return null;
  const content = STEP_CONTENT[step];
  if (!content) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onSkip(); }}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">{content.title}</DialogTitle>
        <DialogDescription className="sr-only">
          Tutorial de como usar o editor de capinhas
        </DialogDescription>
        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === stepIndex ? "w-6 bg-primary" : "w-1.5 bg-muted",
              )}
              aria-hidden
            />
          ))}
        </div>

        {/* Icon */}
        <div className="text-center text-5xl pt-4" aria-hidden>
          {content.icon}
        </div>

        {/* Text */}
        <h2 className="text-xl font-semibold text-center text-foreground">
          {content.title}
        </h2>
        <p className="text-sm text-muted-foreground text-center px-2">
          {content.description}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-2">
          <Button onClick={onNext} className="w-full">
            {content.cta}
          </Button>
          <Button variant="ghost" onClick={onSkip} className="w-full text-muted-foreground">
            Pular tutorial
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
