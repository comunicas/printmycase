import { useEffect, useRef, useState } from "react";

// Shared singleton observer per threshold/rootMargin combo
const observers = new Map<string, { observer: IntersectionObserver; callbacks: Map<Element, (visible: boolean) => void> }>();

function getSharedObserver(options: IntersectionObserverInit) {
  const key = `${options.threshold ?? 0.15}_${options.rootMargin ?? "0px 0px -40px 0px"}`;

  if (!observers.has(key)) {
    const callbacks = new Map<Element, (visible: boolean) => void>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          const cb = callbacks.get(entry.target);
          cb?.(true);
          observer.unobserve(entry.target);
          callbacks.delete(entry.target);
        }
      }
      // Cleanup when empty
      if (callbacks.size === 0) {
        observer.disconnect();
        observers.delete(key);
      }
    }, options);
    observers.set(key, { observer, callbacks });
  }

  return observers.get(key)!;
}

export function useScrollAnimation(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const merged: IntersectionObserverInit = { threshold: 0.15, rootMargin: "0px 0px -40px 0px", ...options };
    const { observer, callbacks } = getSharedObserver(merged);

    callbacks.set(el, () => setIsVisible(true));
    observer.observe(el);

    return () => {
      observer.unobserve(el);
      callbacks.delete(el);
    };
  }, []);

  return { ref, isVisible };
}
