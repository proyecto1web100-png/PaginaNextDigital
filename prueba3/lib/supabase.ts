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

/** Absolute URL of the client portal, used as the OAuth / reset-password return address. */
export const portalUrl = () => `${window.location.origin}${BASE_PATH}/portal/`

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

/** Maps Supabase auth errors to short Spanish messages. */
export function authErrorMessage(error: { message?: string; code?: string; status?: number } | null): string {
  if (!error) return ""
  const code = error.code ?? ""
  const msg = (error.message ?? "").toLowerCase()
  if (code === "invalid_credentials" || msg.includes("invalid login credentials")) return "Correo o contraseña incorrectos."
  if (code === "email_not_confirmed" || msg.includes("email not confirmed")) return "Tu correo aún no está confirmado. Revisa tu bandeja de entrada."
  if (code === "over_request_rate_limit" || code === "over_email_send_rate_limit" || error.status === 429)
    return "Demasiados intentos. Espera un momento y vuelve a intentarlo."
  if (code === "weak_password") return "La contraseña es muy débil. Usa al menos 8 caracteres."
  if (msg.includes("fetch") || msg.includes("network")) return "No pudimos conectar con el servidor. Revisa tu conexión."
  return "No pudimos iniciar sesión. Inténtalo de nuevo."
}
