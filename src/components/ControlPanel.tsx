import { Upload } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ControlPanelProps {
  scale: number;
  rotation: number;
  brightness: number;
  contrast: number;
  onScaleChange: (v: number) => void;
  onRotationChange: (v: number) => void;
  onBrightnessChange: (v: number) => void;
  onContrastChange: (v: number) => void;
  onImageUpload: (file: File) => void;
  hasImage: boolean;
}

const ControlPanel = ({
  scale, rotation, brightness, contrast,
  onScaleChange, onRotationChange, onBrightnessChange, onContrastChange,
  onImageUpload, hasImage,
}: ControlPanelProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageUpload(file);
  };

  const controls = [
    { label: "Scale", value: scale, onChange: onScaleChange, min: 50, max: 200, unit: "%", icon: "⊞" },
    { label: "Rotation", value: rotation, onChange: onRotationChange, min: -180, max: 180, unit: "°", icon: "↻" },
    { label: "Brightness", value: brightness, onChange: onBrightnessChange, min: -100, max: 100, unit: "", icon: "☀" },
    { label: "Contrast", value: contrast, onChange: onContrastChange, min: -100, max: 100, unit: "", icon: "◑" },
  ];

  return (
    <div className="w-full max-w-xs space-y-6">
      {/* Upload button */}
      <div>
        <label
          htmlFor="image-upload"
          className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary font-medium text-sm cursor-pointer hover:bg-primary/10 hover:border-primary/50 transition-all"
        >
          <Upload className="w-4 h-4" />
          {hasImage ? "Change Image" : "Upload Image"}
        </label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Adjustment controls */}
      <div className="space-y-5">
        {controls.map((ctrl) => (
          <div key={ctrl.label} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium flex items-center gap-1.5">
                <span className="text-base opacity-60">{ctrl.icon}</span>
                {ctrl.label}
              </Label>
              <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {ctrl.value}{ctrl.unit}
              </span>
            </div>
            <Slider
              value={[ctrl.value]}
              onValueChange={(v) => ctrl.onChange(v[0])}
              min={ctrl.min}
              max={ctrl.max}
              step={1}
              className="w-full"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ControlPanel;
