import { Maximize, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface AdjustmentsPanelProps {
  scale: number;
  rotation: number;
  onScaleChange: (v: number) => void;
  onRotate: () => void;
  disabled: boolean;
}

const AdjustmentsPanel = ({ scale, rotation, onScaleChange, onRotate, disabled }: AdjustmentsPanelProps) => (
  <div className="space-y-3">
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Maximize className="w-3 h-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Zoom</span>
        </div>
        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${scale !== 100 ? "text-primary" : "text-muted-foreground/40"}`}>
          {scale}%
        </span>
      </div>
      <Slider value={[scale]} onValueChange={(v) => onScaleChange(v[0])} min={50} max={200} step={1} disabled={disabled} />
    </div>

    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={onRotate} disabled={disabled}>
        <RotateCw className="w-3.5 h-3.5" />
        <span className="text-xs">Girar 90°</span>
      </Button>
      {rotation !== 0 && (
        <span className="text-[10px] font-mono text-primary">{rotation}°</span>
      )}
    </div>
  </div>
);

export default AdjustmentsPanel;
