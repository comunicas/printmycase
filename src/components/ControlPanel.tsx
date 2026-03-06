import { forwardRef, useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Maximize, RotateCw, Sun, Contrast, ChevronDown } from "lucide-react";

interface ControlPanelProps {
  scale: number;
  rotation: number;
  brightness: number;
  contrast: number;
  onScaleChange: (v: number) => void;
  onRotationChange: (v: number) => void;
  onBrightnessChange: (v: number) => void;
  onContrastChange: (v: number) => void;
  disabled?: boolean;
}

const ControlPanel = forwardRef<HTMLDivElement, ControlPanelProps>(({
  scale, rotation, brightness, contrast,
  onScaleChange, onRotationChange, onBrightnessChange, onContrastChange,
  disabled,
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  const controls = [
    { label: "Escala", value: scale, onChange: onScaleChange, min: 50, max: 200, defaultVal: 100, unit: "%", icon: Maximize },
    { label: "Rotação", value: rotation, onChange: onRotationChange, min: -180, max: 180, defaultVal: 0, unit: "°", icon: RotateCw },
    { label: "Brilho", value: brightness, onChange: onBrightnessChange, min: -100, max: 100, defaultVal: 0, unit: "", icon: Sun },
    { label: "Contraste", value: contrast, onChange: onContrastChange, min: -100, max: 100, defaultVal: 0, unit: "", icon: Contrast },
  ];

  const hasChanges = controls.some(c => c.value !== c.defaultVal);

  return (
    <div ref={ref} className={`${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Mobile: collapsible trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden flex items-center justify-between w-full py-2"
      >
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          Ajustes
          {hasChanges && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Desktop: always-visible label */}
      <span className="hidden lg:block text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Ajustes</span>

      {/* Controls — always visible on desktop, toggle on mobile */}
      <div className={`space-y-3 overflow-hidden transition-all duration-200 ${isOpen ? "max-h-[500px] opacity-100 mt-2" : "max-h-0 opacity-0 lg:max-h-[500px] lg:opacity-100 lg:mt-0"}`}>
        {controls.map((ctrl) => {
          const Icon = ctrl.icon;
          const isDefault = ctrl.value === ctrl.defaultVal;
          
          return (
            <div key={ctrl.label} className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3 h-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{ctrl.label}</span>
                </div>
                <button
                  onClick={() => ctrl.onChange(ctrl.defaultVal)}
                  disabled={disabled || isDefault}
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                    isDefault
                      ? "text-muted-foreground/40"
                      : "text-primary hover:bg-primary/10 cursor-pointer"
                  }`}
                >
                  {ctrl.value}{ctrl.unit}
                </button>
              </div>
              <Slider
                value={[ctrl.value]}
                onValueChange={(v) => ctrl.onChange(v[0])}
                min={ctrl.min}
                max={ctrl.max}
                step={1}
                className="flex-1"
                disabled={disabled}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
});

ControlPanel.displayName = "ControlPanel";

export default ControlPanel;
