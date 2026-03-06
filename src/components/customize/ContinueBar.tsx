import { ArrowRight, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContinueBarProps {
  isModified: boolean;
  onReset: () => void;
  onContinue: () => void;
  disabled: boolean;
  isRendering: boolean;
}

const ContinueBar = ({ isModified, onReset, onContinue, disabled, isRendering }: ContinueBarProps) => {
  const resetButton = isModified && (
    <Button variant="ghost" size="icon" onClick={onReset} className="shrink-0 text-muted-foreground h-10 w-10">
      <RotateCcw className="w-4 h-4" />
    </Button>
  );

  const continueButton = (
    <Button className="gap-1.5 shrink-0" onClick={onContinue} disabled={disabled}>
      {isRendering ? (
        <><Loader2 className="w-4 h-4 animate-spin" /> Gerando preview...</>
      ) : (
        <>Continuar <ArrowRight className="w-4 h-4" /></>
      )}
    </Button>
  );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex items-center gap-2 w-full max-w-xs mx-auto py-3">
        {resetButton}
        <Button className="flex-1 gap-1.5" onClick={onContinue} disabled={disabled}>
          {isRendering ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Gerando preview...</>
          ) : (
            <>Continuar <ArrowRight className="w-4 h-4" /></>
          )}
        </Button>
      </div>

      {/* Mobile */}
      <div className="flex-shrink-0 lg:hidden border-t border-border bg-background/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center gap-3 px-4 py-3">
          {resetButton}
          <div className="flex-1" />
          {continueButton}
        </div>
      </div>
    </>
  );
};

export default ContinueBar;
