import { useState } from "react";
import { ArrowLeft, Check, HelpCircle, MessageCircleMore } from "lucide-react";
import CoinBalance from "@/components/CoinBalance";
import { Button } from "@/components/ui/button";
import ModelSelector from "./ModelSelector";
import CustomizeContactDialog from "./CustomizeContactDialog";

interface CustomizeHeaderProps {
  productName: string;
  onBack: () => void;
  productImage?: string | null;
  draftSaved?: boolean;
  currentSlug?: string;
  onShowIntro?: () => void;
}

const CustomizeHeader = ({ productName, onBack, productImage, draftSaved, currentSlug, onShowIntro }: CustomizeHeaderProps) => {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0 bg-background">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-2 min-w-0">
          <ModelSelector
            currentSlug={currentSlug}
            productName={productName}
            productImage={productImage}
          />
          <span
            className={`flex items-center gap-0.5 text-xs text-muted-foreground/60 transition-opacity duration-300 ${
              draftSaved ? "opacity-100" : "opacity-0"
            }`}
          >
            <Check className="w-3 h-3" />
            Salvo
          </span>
        </div>

        <div className="flex items-center gap-1">
          {onShowIntro && (
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onShowIntro}>
              <HelpCircle className="w-4 h-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
            aria-label="Abrir contato"
            title="Abrir contato"
            onClick={() => setContactOpen(true)}
          >
            <MessageCircleMore className="w-4 h-4" />
          </Button>
          <CoinBalance />
        </div>
      </div>

      <CustomizeContactDialog open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
};

export default CustomizeHeader;
