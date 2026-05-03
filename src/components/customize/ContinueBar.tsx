import { useState, useCallback } from "react";
import { ArrowRight, Check, Download, Loader2, RotateCcw, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContinueBarProps {
  isModified: boolean;
  onReset: () => void;
  onContinue: () => void;
  disabled: boolean;
  isRendering: boolean;
  inline?: boolean;
  showDownload?: boolean;
  onDownload?: () => Promise<void> | void;
  hasImage?: boolean;
  priceLabel?: string;
}

const ContinueBar = ({ isModified, onReset, onContinue, disabled, isRendering, inline, showDownload, onDownload, hasImage, priceLabel }: ContinueBarProps) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!onDownload || downloading) return;
    setDownloading(true);
    try {
      await onDownload();
    } finally {
      setTimeout(() => setDownloading(false), 1500);
    }
  }, [onDownload, downloading]);

  const resetButton = isModified && (
    <Button variant="ghost" size="icon" onClick={onReset} className="shrink-0 text-muted-foreground h-10 w-10">
      <RotateCcw className="w-4 h-4" />
    </Button>
  );

  const downloadButton = showDownload && onDownload && (
    <Button
      variant="outline"
      onClick={handleDownload}
      className={`shrink-0 gap-1.5 whitespace-nowrap text-sm transition-all duration-200 ${downloading ? "border-green-500 text-green-600" : ""}`}
    >
      {downloading ? (
        <Check className="w-4 h-4 animate-scale-in text-green-600" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">{downloading ? "Baixado!" : "Baixar imagem"}</span>
      <span className="sm:hidden">{downloading ? "Baixado!" : "Baixar"}</span>
    </Button>
  );

  const showRichCta = hasImage && !isRendering;

  const renderButtonContent = () => {
    if (isRendering) {
      return <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>;
    }
    if (!hasImage) {
      return <>📸 Envie uma foto para continuar</>;
    }
    return (
      <>
        <ShoppingBag className="w-5 h-5" />
        Finalizar pedido
        {priceLabel && <span className="ml-auto font-bold">{priceLabel}</span>}
      </>
    );
  };

  const continueTitle = disabled && !hasImage ? "Envie uma foto primeiro para continuar" : undefined;

  const microcopy = showRichCta && (
    <p className="text-center text-xs text-muted-foreground">
      Próximo: endereço e pagamento · Frete grátis para todo o Brasil
    </p>
  );

  const ctaClassName = showRichCta
    ? "flex-1 h-14 rounded-xl text-base font-semibold gap-2 shadow-sm shadow-primary/20 sm:min-w-[220px] sm:flex-none"
    : "flex-1 gap-1.5 sm:min-w-[148px] sm:flex-none";

  if (inline) {
    return (
      <div className="w-full py-3 space-y-2">
        <div className="flex items-center gap-3 w-full">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {resetButton}
            {downloadButton}
          </div>
          <Button className={ctaClassName} onClick={onContinue} disabled={disabled} title={continueTitle}>
            {renderButtonContent()}
          </Button>
        </div>
        {microcopy}
      </div>
    );
  }

  return (
    <>
      {/* Mobile */}
      <div className="flex-shrink-0 lg:hidden border-t border-border bg-background/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="px-3 py-2 space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {resetButton}
              {downloadButton}
            </div>
            <Button
              className={showRichCta ? "h-14 rounded-xl text-base font-semibold gap-2 shadow-sm shadow-primary/20 shrink-0" : "gap-1.5 shrink-0"}
              onClick={onContinue}
              disabled={disabled}
              title={continueTitle}
            >
              {renderButtonContent()}
            </Button>
          </div>
          {microcopy}
        </div>
      </div>
    </>
  );
};

export default ContinueBar;
