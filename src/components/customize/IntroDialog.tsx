import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* ── SVG Illustrations ── */

const WelcomeIllustration = () => (
  <div className="flex flex-col items-center gap-3">
    <img src="/logo-printmycase-sm.webp" alt="PrintMyCase" className="w-16 h-16 rounded-xl" />
    <div className="w-20 h-1 rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary/40" />
  </div>
);

const UploadIllustration = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Phone body */}
    <rect x="28" y="10" width="44" height="80" rx="8" className="stroke-primary" strokeWidth="2.5" fill="none" />
    <rect x="32" y="18" width="36" height="60" rx="2" className="fill-primary/5" />
    {/* Upload arrow */}
    <path d="M50 58 L50 35" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M42 43 L50 35 L58 43" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Cloud hint */}
    <path d="M38 55 C34 55 32 52 32 49 C32 46 34 44 37 44 C38 40 42 38 46 38 C50 38 53 40 54 43 C58 43 61 46 61 49 C61 52 59 55 55 55" className="stroke-primary/50" strokeWidth="1.5" strokeLinecap="round" fill="none" />
  </svg>
);

const AdjustIllustration = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Phone body */}
    <rect x="28" y="10" width="44" height="80" rx="8" className="stroke-primary" strokeWidth="2.5" fill="none" />
    {/* Image placeholder inside */}
    <rect x="35" y="28" width="30" height="30" rx="3" className="fill-primary/10 stroke-primary/40" strokeWidth="1.5" strokeDasharray="4 2" />
    {/* Move arrows */}
    <path d="M50 22 L50 26 M50 62 L50 66" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
    <path d="M30 45 L34 45 M66 45 L70 45" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
    <path d="M50 20 L48 23 M50 20 L52 23" className="stroke-primary" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M50 68 L48 65 M50 68 L52 65" className="stroke-primary" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M28 45 L31 43 M28 45 L31 47" className="stroke-primary" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M72 45 L69 43 M72 45 L69 47" className="stroke-primary" strokeWidth="1.5" strokeLinecap="round" />
    {/* Resize corner */}
    <path d="M60 53 L65 58" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
    <path d="M62 58 L65 58 L65 55" className="stroke-primary" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AiFilterIllustration = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Image frame */}
    <rect x="20" y="22" width="42" height="42" rx="6" className="stroke-primary/40" strokeWidth="2" fill="none" />
    <rect x="24" y="26" width="34" height="34" rx="2" className="fill-primary/5" />
    {/* Landscape in image */}
    <path d="M24 52 L34 42 L44 48 L52 38 L58 46 L58 56 C58 57.1 57.1 58 56 58 L26 58 C24.9 58 24 57.1 24 56 Z" className="fill-primary/15" />
    {/* Magic wand */}
    <line x1="58" y1="30" x2="78" y2="18" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" />
    <rect x="56" y="28" width="5" height="5" rx="1" className="fill-primary" transform="rotate(-35 58 30)" />
    {/* Sparkles */}
    <circle cx="72" cy="32" r="1.5" className="fill-primary" />
    <circle cx="80" cy="26" r="1" className="fill-primary/60" />
    <circle cx="68" cy="22" r="1" className="fill-primary/60" />
    <path d="M75 36 L76 38 L78 37 L77 39 L79 40 L77 41 L78 43 L76 42 L75 44 L74 42 L72 43 L73 41 L71 40 L73 39 L72 37 L74 38 Z" className="fill-primary/80" />
  </svg>
);

const GalleryIllustration = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Grid of thumbnails */}
    <rect x="18" y="20" width="26" height="26" rx="4" className="fill-primary/10 stroke-primary/30" strokeWidth="1.5" />
    <rect x="48" y="20" width="26" height="26" rx="4" className="fill-primary/10 stroke-primary/30" strokeWidth="1.5" />
    <rect x="18" y="50" width="26" height="26" rx="4" className="fill-primary/10 stroke-primary/30" strokeWidth="1.5" />
    <rect x="48" y="50" width="26" height="26" rx="4" className="fill-primary/10 stroke-primary/30" strokeWidth="1.5" />
    {/* Selected highlight on top-right */}
    <rect x="48" y="20" width="26" height="26" rx="4" className="fill-primary/20 stroke-primary" strokeWidth="2.5" />
    {/* Check on selected */}
    <path d="M56 33 L60 37 L68 29" className="stroke-primary" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* Cursor pointer */}
    <path d="M78 42 L78 52 L82 48 L86 50 L87 47 L83 46 L85 42 Z" className="fill-primary/70 stroke-primary" strokeWidth="1" />
  </svg>
);

const CheckoutIllustration = () => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Phone case outline */}
    <rect x="30" y="12" width="40" height="70" rx="10" className="stroke-primary" strokeWidth="2.5" fill="none" />
    <rect x="34" y="20" width="32" height="50" rx="4" className="fill-primary/10" />
    {/* Image inside case */}
    <path d="M34 55 L42 45 L50 50 L58 40 L66 48 L66 66 C66 68.2 64.2 70 62 70 L38 70 C35.8 70 34 68.2 34 66 Z" className="fill-primary/20" />
    {/* Checkmark circle */}
    <circle cx="72" cy="22" r="12" className="fill-primary" />
    <path d="M66 22 L70 26 L78 18" className="stroke-white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Steps Data ── */

const steps = [
  {
    illustration: WelcomeIllustration,
    title: "Bem-vindo ao Studio PrintMyCase",
    description: "Crie sua capinha personalizada em poucos passos",
    isWelcome: true,
  },
  {
    illustration: UploadIllustration,
    title: "Envie sua imagem",
    description: "Faça upload ou tire uma foto direto do celular",
  },
  {
    illustration: AdjustIllustration,
    title: "Ajuste posição e tamanho",
    description: "Arraste, redimensione e rotacione livremente",
  },
  {
    illustration: AiFilterIllustration,
    title: "Aplique Filtros IA",
    description: "Transforme sua imagem com estilos artísticos",
  },
  {
    illustration: GalleryIllustration,
    title: "Escolha da Galeria",
    description: "Use uma imagem pronta da nossa galeria",
  },
  {
    illustration: CheckoutIllustration,
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
  const [direction, setDirection] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [displayStep, setDisplayStep] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const goTo = (next: number) => {
    if (animating || next === step) return;
    const dir = next > step ? 1 : -1;
    setDirection(dir);
    setAnimating(true);
    // After exit animation, swap content and enter
    timeoutRef.current = setTimeout(() => {
      setDisplayStep(next);
      setStep(next);
      timeoutRef.current = setTimeout(() => setAnimating(false), 300);
    }, 150);
  };

  const handleClose = () => {
    localStorage.setItem("customize_intro_seen", "true");
    setStep(0);
    setDisplayStep(0);
    onOpenChange(false);
  };

  const isLast = step === steps.length - 1;
  const current = steps[displayStep];
  const Illustration = current.illustration;

  // During first 150ms: exit (slide out). After: enter (slide in).
  const exitPhase = animating && displayStep === step ? false : animating;
  const enterPhase = animating && displayStep === step;

  let transform = "translateX(0)";
  let opacity = "1";
  if (exitPhase) {
    transform = `translateX(${direction * -30}%)`;
    opacity = "0";
  } else if (enterPhase) {
    // Content just swapped, animating in from opposite side
    // We use a brief no-transition reset then animate
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) handleClose(); }}>
      <DialogContent className="p-0 gap-0 overflow-hidden z-[110] flex flex-col w-screen h-[100dvh] max-w-none rounded-none border-0 top-0 left-0 translate-x-0 translate-y-0 sm:w-auto sm:max-w-xs sm:h-auto sm:max-h-[85vh] sm:rounded-2xl sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:justify-center">
        <div className="flex-1 flex items-center justify-center overflow-hidden sm:flex-initial">
          <div
            className={`w-full flex flex-col items-center text-center px-6 pt-8 pb-6 ${current.isWelcome ? "bg-gradient-to-b from-primary/5 to-transparent" : ""}`}
            style={{
              transform: exitPhase ? `translateX(${direction * -30}%)` : "translateX(0)",
              opacity: exitPhase ? 0 : 1,
              transition: "transform 300ms ease-out, opacity 200ms ease-out",
            }}
          >
            <div className="w-[120px] h-[120px] flex items-center justify-center mb-4">
              <Illustration />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{current.title}</h3>
            <p className="text-sm text-muted-foreground">{current.description}</p>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 pb-4">
          {steps.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
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
            onClick={() => goTo(step - 1)}
            disabled={step === 0 || animating}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </Button>

          {isLast ? (
            <Button size="sm" onClick={handleClose}>
              Entendi!
            </Button>
          ) : (
            <Button size="sm" onClick={() => goTo(step + 1)} disabled={animating} className="gap-1">
              Próximo <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IntroDialog;
