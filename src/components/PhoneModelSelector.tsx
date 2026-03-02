import { phoneModels, type PhoneModel } from "@/lib/phoneModels";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface PhoneModelSelectorProps {
  selectedId: string;
  onSelect: (model: PhoneModel) => void;
}

const MiniPhone = ({ model, selected }: { model: PhoneModel; selected: boolean }) => {
  const w = 28;
  const h = w * model.aspectRatio;
  const moduleW = (model.cameraModule.width / 100) * w;
  const moduleH = moduleW; // square

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-all border-2",
        selected
          ? "border-primary bg-primary/5"
          : "border-transparent hover:bg-muted"
      )}
    >
      {/* Mini frame */}
      <div
        className="relative bg-muted-foreground/10 border border-muted-foreground/20"
        style={{
          width: w,
          height: h,
          borderRadius: 6,
        }}
      >
        {/* Mini camera module */}
        <div
          className="absolute bg-muted-foreground/40"
          style={{
            top: `${model.cameraModule.top}%`,
            left: `${model.cameraModule.left}%`,
            width: moduleW,
            height: moduleH,
            borderRadius: 3,
          }}
        >
          {model.lenses.map((lens, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-muted-foreground/60"
              style={{
                top: `${lens.top}%`,
                left: `${lens.left}%`,
                width: `${lens.size}%`,
                height: `${lens.size}%`,
              }}
            />
          ))}
        </div>
      </div>
      <span className="text-[9px] text-muted-foreground whitespace-nowrap leading-tight">
        {model.name.replace("iPhone ", "")}
      </span>
    </div>
  );
};

const PhoneModelSelector = ({ selectedId, onSelect }: PhoneModelSelectorProps) => {
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-1 pb-2">
        {phoneModels.map((model) => (
          <div key={model.id} onClick={() => onSelect(model)}>
            <MiniPhone model={model} selected={model.id === selectedId} />
          </div>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};

export default PhoneModelSelector;
