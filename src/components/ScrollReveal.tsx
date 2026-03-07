import { ReactNode, forwardRef, useCallback } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

const ScrollReveal = forwardRef<HTMLDivElement, ScrollRevealProps>(
  ({ children, delay = 0, className }, extRef) => {
    const { ref: animRef, isVisible } = useScrollAnimation();

    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        (animRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        if (typeof extRef === "function") extRef(node);
        else if (extRef) extRef.current = node;
      },
      [animRef, extRef]
    );

    return (
      <div
        ref={mergedRef}
        className={cn(
          "scroll-reveal transition-all duration-700 ease-out",
          isVisible ? "opacity-100 translate-y-0" : "sr-hidden",
          className
        )}
        style={{ transitionDelay: `${delay}ms` }}
      >
        {children}
      </div>
    );
  }
);
ScrollReveal.displayName = "ScrollReveal";

export default ScrollReveal;
