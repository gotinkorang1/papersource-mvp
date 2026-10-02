import { beforeEach, describe, expect, it, vi } from "vitest";
import { ANALYTICS_CONSENT_KEY } from "@/lib/analytics";
import { clearAnalyticsConsent, CONSENT_EVENT, dispatchAnalyticsConsent } from "./consent-banner";

describe("analytics consent controls", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persists a deliberate consent choice and broadcasts it", () => {
    const listener = vi.fn();
    window.addEventListener(CONSENT_EVENT, listener);

    dispatchAnalyticsConsent("granted");

    expect(window.localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBe("granted");
    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toBe("granted");
    window.removeEventListener(CONSENT_EVENT, listener);
  });

  it("removes consent and broadcasts a reset so the banner can reopen", () => {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, "granted");
    const listener = vi.fn();
    window.addEventListener(CONSENT_EVENT, listener);

    clearAnalyticsConsent();

    expect(window.localStorage.getItem(ANALYTICS_CONSENT_KEY)).toBeNull();
    expect(listener).toHaveBeenCalledTimes(1);
    expect((listener.mock.calls[0][0] as CustomEvent).detail).toBe("reset");
    window.removeEventListener(CONSENT_EVENT, listener);
  });
});
