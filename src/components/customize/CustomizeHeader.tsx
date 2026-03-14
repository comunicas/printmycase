import { ArrowLeft, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CustomizeHeaderProps {
  productName: string;
  onBack: () => void;
  productImage?: string | null;
  draftSaved?: boolean;
}

const CustomizeHeader = ({ productName, onBack, productImage, draftSaved }: CustomizeHeaderProps) => (
  <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0">
    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onBack}>
      <ArrowLeft className="w-5 h-5" />
    </Button>

    <div className="flex items-center gap-2 min-w-0">
      {productImage && (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <img
                src={productImage}
                alt={productName}
                className="w-7 h-7 rounded-md object-cover border border-border flex-shrink-0 cursor-pointer"
              />
            </TooltipTrigger>
            <TooltipContent side="bottom" className="p-1">
              <img
                src={productImage}
                alt={productName}
                className="w-48 h-auto rounded-md object-contain"
              />
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      <span className="text-sm font-medium text-muted-foreground truncate">{productName}</span>
      <span
        className={`flex items-center gap-0.5 text-xs text-muted-foreground/60 transition-opacity duration-300 ${
          draftSaved ? "opacity-100" : "opacity-0"
        }`}
      >
        <Check className="w-3 h-3" />
        Salvo
      </span>
    </div>

    <div className="w-8" />
  </div>
);

export default CustomizeHeader;
