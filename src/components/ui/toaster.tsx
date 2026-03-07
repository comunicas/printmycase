import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { CheckCircle2, AlertCircle } from "lucide-react";

const TOAST_DURATION = 4000;

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider duration={TOAST_DURATION}>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isDestructive = variant === "destructive";
        const Icon = isDestructive ? AlertCircle : CheckCircle2;

        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3 w-full">
              <Icon className={`h-5 w-5 shrink-0 mt-0.5 ${isDestructive ? "text-destructive-foreground" : "text-primary"}`} />
              <div className="grid gap-0.5 flex-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
              <div
                className={`h-full ${isDestructive ? "bg-destructive-foreground/30" : "bg-primary/30"}`}
                style={{
                  animation: `toast-progress ${TOAST_DURATION}ms linear forwards`,
                }}
              />
            </div>
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
