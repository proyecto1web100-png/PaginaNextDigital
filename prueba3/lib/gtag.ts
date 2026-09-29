/** Google Ads tag (gtag.js). Loaded on every page from the root layout with Consent Mode v2. */
export const ADS_ID = "AW-18468947615"

/** Google Ads conversion action "Contacto (1)": a tap on any WhatsApp link. */
export const WHATSAPP_CONVERSION = `${ADS_ID}/jRDcCOiD_oodEJ-N1-ZE`

type Gtag = (...args: unknown[]) => void
const gtag: Gtag = (...args) => (window as unknown as { gtag?: Gtag }).gtag?.(...args)

/**
 * Runs in <head> before gtag.js: everything starts denied (no Google cookies) and is granted
 * only if the visitor already accepted in the cookie banner (same `nd-consent` key as lib/consent).
 */
export const GTAG_BOOTSTRAP = `
window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500});
try{var c=JSON.parse(localStorage.getItem('nd-consent')||'null');if(c&&c.analytics){gtag('consent','update',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});}}catch(e){}
gtag('js',new Date());gtag('config','${ADS_ID}');
`

/** Mirrors the cookie-banner choice into Google's consent state. */
export function updateGtagConsent(granted: boolean) {
  const v = granted ? "granted" : "denied"
  gtag("consent", "update", { ad_storage: v, analytics_storage: v, ad_user_data: v, ad_personalization: v })
}

/** Sends a Google Ads event (e.g. a WhatsApp tap or a quote request). */
export function gtagEvent(name: string, params: Record<string, unknown> = {}) {
  gtag("event", name, params)
}
