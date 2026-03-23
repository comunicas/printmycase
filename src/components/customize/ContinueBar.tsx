import { ArrowRight, Download, Loader2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  const resetButton = isModified && (
    <Button variant="ghost" size="icon" onClick={onReset} className="shrink-0 text-muted-foreground h-10 w-10">
      <RotateCcw className="w-4 h-4" />
    </Button>
  );

  const downloadButton = showDownload && onDownload && (
    <Button variant="outline" onClick={onDownload} className="shrink-0 gap-1.5">
      <Download className="w-4 h-4" />
      Baixar imagem
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
