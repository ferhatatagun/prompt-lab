const KEY_API = "promptlab:apiKey";

export function loadApiKey(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(KEY_API) ?? "";
}

export function saveApiKey(key: string): void {
  if (typeof window === "undefined") return;
  if (!key) window.localStorage.removeItem(KEY_API);
  else window.localStorage.setItem(KEY_API, key);
}
