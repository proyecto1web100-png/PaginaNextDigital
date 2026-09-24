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

export type AccessStatus = "pending" | "approved" | "rejected"

export type AccessRequest = {
  user_id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  status: AccessStatus
  created_at: string
}

export const PLANS = ["Básico", "Intermedio", "Avanzado"] as const
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
