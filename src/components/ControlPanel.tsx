import { forwardRef } from "react";
import { Slider } from "@/components/ui/slider";
import { Maximize, RotateCw, Sun, Contrast } from "lucide-react";

interface ControlPanelProps {
  scale: number;
  rotation: number;
  brightness: number;
  contrast: number;
  onScaleChange: (v: number) => void;
  onRotationChange: (v: number) => void;
  onBrightnessChange: (v: number) => void;
  onContrastChange: (v: number) => void;
}

const ControlPanel = forwardRef<HTMLDivElement, ControlPanelProps>(({
  scale, rotation, brightness, contrast,
  onScaleChange, onRotationChange, onBrightnessChange, onContrastChange,
}, ref) => {
  const controls = [
    { label: "Scale", value: scale, onChange: onScaleChange, min: 50, max: 200, defaultVal: 100, unit: "%", icon: Maximize },
    { label: "Rotate", value: rotation, onChange: onRotationChange, min: -180, max: 180, defaultVal: 0, unit: "°", icon: RotateCw },
    { label: "Bright", value: brightness, onChange: onBrightnessChange, min: -100, max: 100, defaultVal: 0, unit: "", icon: Sun },
    { label: "Contrast", value: contrast, onChange: onContrastChange, min: -100, max: 100, defaultVal: 0, unit: "", icon: Contrast },
  ];

  return (
    <div ref={ref} className="space-y-3">
      <span className="text-sm font-medium text-foreground">Adjustments</span>
      <div className="space-y-2.5">
        {controls.map((ctrl) => {
          const Icon = ctrl.icon;
          const isDefault = ctrl.value === ctrl.defaultVal;
          return (
            <div key={ctrl.label} className="flex items-center gap-3">
              <button
                onClick={() => ctrl.onChange(ctrl.defaultVal)}
                className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                  isDefault ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}
                title={`Reset ${ctrl.label}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
              <Slider
                value={[ctrl.value]}
                onValueChange={(v) => ctrl.onChange(v[0])}
                min={ctrl.min}
                max={ctrl.max}
                step={1}
                className="flex-1"
              />
              <span className="flex-shrink-0 w-12 text-right text-xs font-mono text-muted-foreground">
                {ctrl.value}{ctrl.unit}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

ControlPanel.displayName = "ControlPanel";

export default ControlPanel;
