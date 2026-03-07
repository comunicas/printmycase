import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomizeHeaderProps {
  productName: string;
  onBack: () => void;
}

const CustomizeHeader = ({ productName, onBack }: CustomizeHeaderProps) => (
  <div className="flex items-center justify-between px-3 py-1.5 flex-shrink-0">
    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={onBack}>
      <ArrowLeft className="w-5 h-5" />
    </Button>
    <span className="text-sm font-medium text-muted-foreground truncate">{productName}</span>
    <div className="w-8" />
  </div>
);

export default CustomizeHeader;
