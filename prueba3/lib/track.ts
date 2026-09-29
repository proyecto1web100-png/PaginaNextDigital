import { readConsent } from "./consent"
import { WHATSAPP_CONVERSION, gtagEvent } from "./gtag"
import { BASE_PATH } from "./site"
import { supabase } from "./supabase"

export type EventKind = "view" | "whatsapp" | "quote"

/** Page path without the GitHub Pages prefix, so both hosts report the same paths. */
const currentPath = () => {
  const p = window.location.pathname
  const clean = BASE_PATH && p.startsWith(BASE_PATH) ? p.slice(BASE_PATH.length) || "/" : p
  return clean.slice(0, 200)
}

/** Host of the external site the visitor came from (null for direct visits or internal links). */
const referrerHost = () => {
  try {
    if (!document.referrer) return null
    const host = new URL(document.referrer).hostname.replace(/^www\./, "")
    return host === window.location.hostname ? null : host.slice(0, 200)
  } catch {
    return null
  }
}

/**
 * Records an anonymous event, only when the visitor accepted statistics.
 * No IP, cookie or identifier is stored — just kind, path, referrer host and device type.
 */
export function track(kind: EventKind) {
  // Google Ads events (Consent Mode decides whether Google may use cookies for them).
  if (kind === "whatsapp") gtagEvent("conversion", { send_to: WHATSAPP_CONVERSION, value: 1.0, currency: "USD" })
  if (kind === "quote") gtagEvent("generate_lead", { method: "quote_form" })
  if (!supabase || !readConsent()?.analytics) return
  void supabase
    .from("site_events")
    .insert({
      kind,
      path: currentPath(),
      referrer: kind === "view" ? referrerHost() : null,
      device: window.matchMedia("(max-width: 767px)").matches ? "mobile" : "desktop",
    })
    .then(() => undefined)
}
