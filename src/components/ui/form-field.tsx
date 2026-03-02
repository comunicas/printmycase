import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  id: string;
  required?: boolean;
  error?: string;
  hint?: string;
  className?: string;
  labelExtra?: ReactNode;
  children: ReactNode;
}

const FormField = ({ label, id, required, error, hint, className, labelExtra, children }: FormFieldProps) => (
  <div className={cn("space-y-2", className)}>
    <div className="flex items-center justify-between">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {labelExtra}
    </div>
    {children}
    {error && <p className="text-xs text-destructive">{error}</p>}
    {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
  </div>
);

export default FormField;
