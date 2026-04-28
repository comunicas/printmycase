import { Check } from "lucide-react";

interface JourneyProgressProps {
  currentStep: 1 | 2 | 3; // 1=Modelo, 2=Design, 3=Entrega
}

const steps = [
  { label: "Modelo" },
  { label: "Design" },
  { label: "Entrega" },
];

const JourneyProgress = ({ currentStep }: JourneyProgressProps) => (
  <div className="w-full bg-background border-b border-border">
    <div className="max-w-xl mx-auto w-full px-5 py-3 flex items-center gap-2">
      {steps.map((step, i) => {
        const stepNum = i + 1;
        const done = stepNum < currentStep;
        const active = stepNum === currentStep;
        return (
          <div key={step.label} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  done
                    ? "bg-primary text-primary-foreground"
                    : active
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <Check className="w-3.5 h-3.5" /> : stepNum}
              </div>
              <span
                className={`text-sm whitespace-nowrap ${
                  active
                    ? "font-semibold text-foreground"
                    : done
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 rounded-full transition-colors ${
                  done ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

export default JourneyProgress;
