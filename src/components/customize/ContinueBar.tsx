import { ArrowRight, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/types";

interface ContinueBarProps {
  isModified: boolean;
  onReset: () => void;
  onContinue: () => void;
  disabled: boolean;
  isRendering: boolean;
  productName?: string;
  priceCents?: number;
}

const ContinueBar = ({ isModified, onReset, onContinue, disabled, isRendering, productName, priceCents }: ContinueBarProps) => {
  const price = priceCents != null ? formatPrice(priceCents / 100) : null;

  const resetButton = isModified && (
    <Button variant="ghost" size="icon" onClick={onReset} className="shrink-0 text-muted-foreground h-10 w-10">
      <RotateCcw className="w-4 h-4" />
    </Button>
  );

  const renderButtonContent = (showName: boolean) =>
    isRendering ? (
      <><Loader2 className="w-4 h-4 animate-spin" /> Gerando preview...</>
    ) : (
      <>
        Finalizar
        {showName && productName && <span className="opacity-70">· {productName}</span>}
        {price && <span className="opacity-70">· {price}</span>}
        <ArrowRight className="w-4 h-4" />
      </>
    );

  return (
    <>
      {/* Desktop */}
      <div className="hidden lg:flex items-center gap-2 w-full max-w-sm mx-auto py-3">
        {resetButton}
        <Button className="flex-1 gap-1.5" onClick={onContinue} disabled={disabled}>
          {renderButtonContent(true)}
        </Button>
      </div>

      {/* Mobile */}
      <div className="flex-shrink-0 lg:hidden border-t border-border bg-background/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center gap-3 px-3 py-2">
          {resetButton}
          <div className="flex-1" />
          <Button className="gap-1.5 shrink-0" onClick={onContinue} disabled={disabled}>
            {renderButtonContent(false)}
          </Button>
        </div>
      </div>
    </>
  );
};

export default ContinueBar;
