import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { clarityEvent, clarityTag } from "@/lib/clarity";

const routeToStep: [RegExp, string][] = [
  [/^\/checkout\/success/, "funnel_purchase_complete"],
  [/^\/checkout\//, "funnel_checkout"],
  [/^\/customize\//, "funnel_customize"],
  [/^\/product\//, "funnel_product_view"],
  [/^\/catalog$/, "funnel_catalog"],
  [/^\/$/, "funnel_landing"],
];

export function ClarityFunnelTracker() {
  const { pathname } = useLocation();

  useEffect(() => {
    for (const [pattern, step] of routeToStep) {
      if (pattern.test(pathname)) {
        clarityEvent(step);
        clarityTag("funnel_step", step);
        break;
      }
    }
  }, [pathname]);

  return null;
}
