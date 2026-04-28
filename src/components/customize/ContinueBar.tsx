import { useState, useCallback } from "react";
import { ArrowRight, Check, Download, Loader2, RotateCcw } from "lucide-react";
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
}

const ContinueBar = ({ isModified, onReset, onContinue, disabled, isRendering, inline, showDownload, onDownload, hasImage }: ContinueBarProps) => {
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

  const renderButtonContent = () => {
    if (isRendering) {
      return <><Loader2 className="w-4 h-4 animate-spin" /> Processando...</>;
    }
    if (!hasImage) {
      return <>📸 Envie uma foto para continuar</>;
    }
    return <>Ver resumo e pedir <ArrowRight className="w-4 h-4" /></>;
  };

  const continueTitle = disabled && !hasImage ? "Envie uma foto primeiro para continuar" : undefined;

  if (inline) {
    return (
      <div className="w-full py-3">
        <div className="flex items-center gap-3 w-full">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {resetButton}
            {downloadButton}
          </div>
          <Button className="flex-1 gap-1.5 sm:min-w-[148px] sm:flex-none" onClick={onContinue} disabled={disabled} title={continueTitle}>
            {renderButtonContent()}
          </Button>
        </div>
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
            <Button className="gap-1.5 shrink-0" onClick={onContinue} disabled={disabled} title={continueTitle}>
              {renderButtonContent()}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContinueBar;
