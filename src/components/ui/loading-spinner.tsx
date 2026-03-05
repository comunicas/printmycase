import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  variant?: "fullPage" | "inline";
  className?: string;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ variant = "inline", className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-center",
          variant === "fullPage" ? "min-h-screen bg-background" : "py-12",
          className
        )}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }
);
LoadingSpinner.displayName = "LoadingSpinner";

export default LoadingSpinner;
