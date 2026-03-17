declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function pixelEvent(name: string, params?: Record<string, unknown>) {
  window.fbq?.("track", name, params);
}

export function pixelEventWithId(
  name: string,
  params?: Record<string, unknown>,
  eventId?: string
) {
  const id = eventId || generateEventId();
  window.fbq?.("track", name, params, { eventID: id });
  return id;
}

export function pixelTrackPurchase(
  valueBRL: number,
  contentId?: string,
  eventId?: string
) {
  const id = eventId || generateEventId();
  window.fbq?.(
    "track",
    "Purchase",
    {
      value: valueBRL,
      currency: "BRL",
      ...(contentId ? { content_ids: [contentId] } : {}),
    },
    { eventID: id }
  );
  return id;
}
