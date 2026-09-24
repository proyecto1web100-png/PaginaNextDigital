/**
 * Cookie/storage consent. Only optional categories need consent; the Supabase login session
 * (stored in localStorage) is strictly necessary for the client portal and is always allowed.
 */
export type Consent = { analytics: boolean; version: 1; date: string }

const KEY = "nd-consent"
const EVENT = "nd-consent-change"
const OPEN_EVENT = "nd-consent-open"

export function readConsent(): Consent | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const c = JSON.parse(raw) as Consent
    return c.version === 1 ? c : null
  } catch {
    return null
  }
}

export function saveConsent(analytics: boolean) {
  const c: Consent = { analytics, version: 1, date: new Date().toISOString() }
  try {
    window.localStorage.setItem(KEY, JSON.stringify(c))
  } catch {
    /* private mode: the choice lasts for this page view only */
  }
  window.dispatchEvent(new CustomEvent<Consent>(EVENT, { detail: c }))
}

export function onConsentChange(cb: (c: Consent) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<Consent>).detail)
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}

/** Reopens the banner (footer "Preferencias de cookies"). */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_EVENT))
}

export function onOpenCookieSettings(cb: () => void) {
  window.addEventListener(OPEN_EVENT, cb)
  return () => window.removeEventListener(OPEN_EVENT, cb)
}
