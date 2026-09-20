export function readSessionFlag(key: string) {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function writeSessionFlag(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts.
  }
}
