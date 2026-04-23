export type ConsentState = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
};

export const COOKIE_CONSENT_KEY = "cookie_consent_v1";

export function getDefaultConsent(): ConsentState {
  return {
    essential: true,
    analytics: false,
    marketing: false,
  };
}

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentState;
  } catch {
    return null;
  }
}

export function writeConsent(value: ConsentState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event("cookie-consent-updated"));
}

export function clearConsent() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(COOKIE_CONSENT_KEY);
  window.dispatchEvent(new Event("cookie-consent-updated"));
}

export function hasAnalyticsConsent() {
  return Boolean(readConsent()?.analytics);
}

export function hasMarketingConsent() {
  return Boolean(readConsent()?.marketing);
}