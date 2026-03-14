declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function pixelEvent(name: string, params?: Record<string, unknown>) {
  window.fbq?.("track", name, params);
}

export function pixelTrackPurchase(valueBRL: number, contentId?: string) {
  window.fbq?.("track", "Purchase", {
    value: valueBRL,
    currency: "BRL",
    ...(contentId ? { content_ids: [contentId] } : {}),
  });
}
