import { useState, useCallback } from "react";
import { ArrowRight, Check, Download, Loader2, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

interface ContinueBarProps {
  isModified: boolean;
  onReset: () => void;
  onContinue: () => void;
  disabled: boolean;
  isRendering: boolean;
  inline?: boolean;
  showDownload?: boolean;
  onDownload?: () => void;
}

const ContinueBar = ({ isModified, onReset, onContinue, disabled, isRendering, inline, showDownload, onDownload }: ContinueBarProps) => {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(() => {
    if (!onDownload || downloading) return;
    setDownloading(true);
    onDownload();
    toast({ title: "Imagem baixada", description: "A imagem foi salva com sucesso." });
    setTimeout(() => setDownloading(false), 1500);
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
      <><Loader2 className="w-4 h-4 animate-spin" /> Gerando preview...</>
    ) : (
      <>
        Finalizar
        <ArrowRight className="w-4 h-4" />
      </>
    );

  if (inline) {
    return (
      <div className="flex items-center gap-2 w-full py-3">
        {resetButton}
        {downloadButton}
        <Button className="flex-1 gap-1.5" onClick={onContinue} disabled={disabled}>
          {renderButtonContent()}
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile */}
      <div className="flex-shrink-0 lg:hidden border-t border-border bg-background/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center gap-3 px-3 py-2">
          {resetButton}
          {downloadButton}
          <div className="flex-1" />
          <Button className="gap-1.5 shrink-0" onClick={onContinue} disabled={disabled}>
            {renderButtonContent()}
          </Button>
        </div>
      </div>
    </>
  );
};

export default ContinueBar;
