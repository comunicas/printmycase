import { forwardRef } from "react";
import { Maximize, RotateCw, Expand } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";

interface AdjustmentsPanelProps {
  scale: number;
  rotation: number;
  showSafeZone: boolean;
  onScaleChange: (v: number) => void;
  onRotate: () => void;
  onExpand: () => void;
  onShowSafeZoneChange: (checked: boolean) => void;
  disabled: boolean;
}

const AdjustmentsPanel = forwardRef<HTMLDivElement, AdjustmentsPanelProps>(({
  scale, rotation, showSafeZone, onScaleChange, onRotate, onExpand, onShowSafeZoneChange, disabled,
}, ref) => (
  <div ref={ref} className="space-y-3">
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

    <div className="flex items-center gap-2 flex-wrap">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={onRotate} disabled={disabled}>
        <RotateCw className="w-3.5 h-3.5" />
        <span className="text-xs">Girar 90°</span>
      </Button>
      {rotation !== 0 && (
        <span className="text-[10px] font-mono text-primary">{rotation}°</span>
      )}

      <Button variant="outline" size="sm" className="gap-1.5" onClick={onExpand} disabled={disabled}>
        <Expand className="w-3.5 h-3.5" />
        <span className="text-xs">Expandir</span>
      </Button>
    </div>

    <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
      <div className="space-y-0.5">
        <p className="text-xs font-medium text-foreground">Safe zone da câmera</p>
        <p className="text-[10px] text-muted-foreground">Mostrar a área segura no topo do aparelho</p>
      </div>
      <Switch checked={showSafeZone} onCheckedChange={onShowSafeZoneChange} disabled={disabled} />
    </div>
  </div>
));

AdjustmentsPanel.displayName = "AdjustmentsPanel";

export default AdjustmentsPanel;
