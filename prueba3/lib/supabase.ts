import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { BASE_PATH } from "./site"

// Public project URL + anon key (safe to ship to the browser; data is protected by RLS).
// Set them in .env.local (see README) before `npm run build`.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase: SupabaseClient | null =
  url && anonKey
    ? createClient(url, anonKey, {
        auth: { flowType: "pkce", persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null

export const isAuthConfigured = supabase !== null

/**
 * Asks Supabase whether the Google provider is enabled, so we can show a clear message
 * instead of Supabase's raw JSON error page. Returns null if the check itself fails.
 */
export async function isGoogleEnabled(): Promise<boolean | null> {
  if (!url || !anonKey) return false
  try {
    const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: anonKey } })
    if (!res.ok) return null
    const settings = (await res.json()) as { external?: Record<string, boolean> }
    return Boolean(settings.external?.google)
  } catch {
    return null
  }
}

/** Error returned by Supabase/Google in the redirect URL (?error_description=… or #error_description=…). */
export function redirectError(): string | null {
  if (typeof window === "undefined") return null
  const params = new URLSearchParams(window.location.search)
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""))
  const desc = params.get("error_description") ?? hash.get("error_description")
  const code = params.get("error") ?? hash.get("error")
  if (!desc && !code) return null
  if (code === "access_denied") return "Cancelaste el inicio de sesión con Google."
  if (desc?.toLowerCase().includes("database error")) return "No pudimos registrar tu cuenta. Escríbenos y lo revisamos."
  return "No pudimos completar el inicio de sesión con Google. Inténtalo de nuevo."
}

/**
 * Absolute URL of the client portal, used as the OAuth return address.
 * Uses the base path only when the page is actually served under it: on Netlify the site
 * lives at the domain root, so the return URL is simply https://<domain>/portal/.
 */
export const portalUrl = () => {
  const prefix = BASE_PATH && window.location.pathname.startsWith(BASE_PATH) ? BASE_PATH : ""
  return `${window.location.origin}${prefix}/portal/`
}

export type ProjectStatus = "diseño" | "desarrollo" | "revisión" | "publicado"

export type ClientProject = {
  id: string
  name: string
  plan: string | null
  status: ProjectStatus
  progress: number
  next_step: string | null
  site_url: string | null
  updated_at: string
}

export type AccessStatus = "pending" | "approved" | "rejected"

export type AccessRequest = {
  user_id: string
  email: string
  full_name: string | null
  business_name: string | null
  avatar_url: string | null
  status: AccessStatus
  created_at: string
  /** Set when the client completed the request form (name, business). */
  submitted_at: string | null
}

/** The signed-in client's own request, as shown in their portal. */
export type OwnRequest = Pick<AccessRequest, "status" | "full_name" | "business_name" | "submitted_at">

export const PLANS = ["Básico", "Intermedio", "Avanzado", "Negocios"] as const
export const STAGES: ProjectStatus[] = ["diseño", "desarrollo", "revisión", "publicado"]
export const STAGE_LABEL: Record<ProjectStatus, string> = {
  diseño: "Diseño",
  desarrollo: "Desarrollo",
  revisión: "Revisión",
  publicado: "Publicado",
}

/** Maps Supabase errors to short Spanish messages. */
export function authErrorMessage(error: { message?: string; code?: string; status?: number } | null): string {
  if (!error) return ""
  const msg = (error.message ?? "").toLowerCase()
  if (error.code === "over_request_rate_limit" || error.status === 429) return "Demasiados intentos. Espera un momento y vuelve a intentarlo."
  if (msg.includes("provider is not enabled")) return "El acceso con Google todavía no está activado."
  if (msg.includes("fetch") || msg.includes("network")) return "No pudimos conectar con el servidor. Revisa tu conexión."
  return "Algo salió mal. Inténtalo de nuevo."
}
