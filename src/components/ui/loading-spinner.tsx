import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  variant?: "fullPage" | "inline";
  className?: string;
  message?: string;
}

const LoadingSpinner = ({ variant = "inline", className, message }: LoadingSpinnerProps) => (
  <div
    className={cn(
      "flex items-center justify-center",
      variant === "fullPage" ? "min-h-screen bg-background" : "py-12",
      className,
    )}
  >
    <div className="flex flex-col items-center gap-3 text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  </div>
);

export default LoadingSpinner;
