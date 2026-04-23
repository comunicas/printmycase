import { useState, useCallback } from "react";
import { ArrowRight, Check, Download, Loader2, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
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
}

const ContinueBar = ({ isModified, onReset, onContinue, disabled, isRendering, inline, showDownload, onDownload }: ContinueBarProps) => {
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

  const renderButtonContent = () =>
    isRendering ? (
      <><Loader2 className="w-4 h-4 animate-spin" /> Processando compra...</>
    ) : (
      <>
        Finalizar
        <ArrowRight className="w-4 h-4" />
      </>
    );

  if (inline) {
    return (
      <div className="w-full py-3 space-y-2">
        <div className="flex items-center gap-2 w-full">
          {resetButton}
          {downloadButton}
          <Button className="flex-1 gap-1.5" onClick={onContinue} disabled={disabled}>
            {renderButtonContent()}
          </Button>
        </div>
        <Link to="/contato" className="block text-center text-sm text-primary hover:text-primary/80 transition-colors">
          Precisando de ajuda? Fale Conosco
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Mobile */}
      <div className="flex-shrink-0 lg:hidden border-t border-border bg-background/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="px-3 py-2 space-y-2">
          <div className="flex items-center gap-3">
            {resetButton}
            {downloadButton}
            <div className="flex-1" />
            <Button className="gap-1.5 shrink-0" onClick={onContinue} disabled={disabled}>
              {renderButtonContent()}
            </Button>
          </div>
          <Link to="/contato" className="block text-center text-sm text-primary hover:text-primary/80 transition-colors">
            Precisando de ajuda? Fale Conosco
          </Link>
        </div>
      </div>
    </>
  );
};

export default ContinueBar;
