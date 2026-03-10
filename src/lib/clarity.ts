declare global {
  interface Window {
    clarity?: (...args: unknown[]) => void;
  }
}

export function clarityEvent(name: string) {
  window.clarity?.("event", name);
}

export function clarityIdentify(userId: string, email?: string) {
  if (email) {
    window.clarity?.("identify", userId, undefined, undefined, email);
  } else {
    window.clarity?.("identify", userId);
  }
}

export function clarityTag(key: string, value: string) {
  window.clarity?.("set", key, value);
}
