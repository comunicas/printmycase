import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomizeHeaderProps {
  productName: string;
  onBack: () => void;
}

const CustomizeHeader = ({ productName, onBack }: CustomizeHeaderProps) => (
  <div className="flex items-center justify-between px-3 py-2 flex-shrink-0">
    <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={onBack}>
      <ArrowLeft className="w-5 h-5" />
    </Button>
    <span className="text-sm font-medium text-muted-foreground truncate">{productName}</span>
    <div className="w-9" />
  </div>
);

export default CustomizeHeader;
