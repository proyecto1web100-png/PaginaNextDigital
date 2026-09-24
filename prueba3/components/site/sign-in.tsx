"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Check, Loader2 } from "lucide-react"
import { FaGoogle } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Pill } from "@/components/ui/pill"
import { wa } from "@/lib/site"
import { authErrorMessage, isAuthConfigured, portalUrl, supabase } from "@/lib/supabase"
import { inView } from "./motion"

const NOT_CONFIGURED = "El portal de clientes todavía no está conectado. Mientras tanto, escríbenos por WhatsApp."

const STEPS = [
  "Inicia sesión con tu cuenta de Google.",
  "NextDigital aprueba tu acceso y lo vincula a tu página web.",
  "Desde ahí sigues el avance de tu proyecto.",
]

export function SignIn() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [signedInAs, setSignedInAs] = useState<string | null>(null)

  // If there is already a session, offer a shortcut to the portal.
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSignedInAs(data.session?.user.email ?? null))
  }, [])

  async function onGoogle() {
    if (!supabase) {
      setInfo(NOT_CONFIGURED)
      return
    }
    setBusy(true)
    setError("")
    // Leaves the page for Google; Supabase brings the user back to /portal/ signed in.
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: portalUrl(), queryParams: { prompt: "select_account" } },
    })
    if (error) {
      setBusy(false)
      setError(authErrorMessage(error))
    }
  }

  return (
    <section id="acceso" aria-labelledby="signin-title" className="mx-auto grid w-full max-w-[1180px] gap-12 px-4 py-20 md:grid-cols-2 md:items-center md:px-8 md:py-28">
      <motion.div {...inView} className="max-w-md">
        <p className="flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          <span aria-hidden className="h-[2px] w-7 rounded-full bg-orange" />
          04 · Portal de clientes
        </p>
        <h2 id="signin-title" className="mt-4 text-[clamp(2.3rem,5.4vw,4.4rem)] font-bold leading-[1.02]">
          Tu proyecto, en un solo lugar.
        </h2>
        <p className="mt-5 text-[17px] leading-relaxed text-ink-2 md:text-lg">
          Revisa el avance de tu web, en qué etapa está y cuál es el siguiente paso.
        </p>
        <Pill tone="brand" className="mt-6">{isAuthConfigured ? "Solo clientes" : "Próximamente"}</Pill>
      </motion.div>

      <motion.div {...inView} className="w-full max-w-md rounded-[28px] border border-border bg-card p-6 shadow-[0_30px_60px_-30px_rgba(18,18,18,0.3)] md:ml-auto md:p-8">
        {signedInAs ? (
          <div className="grid gap-4 text-center">
            <p className="text-ink-2">
              Ya iniciaste sesión como <span className="font-semibold text-foreground">{signedInAs}</span>.
            </p>
            <Button type="button" size="lg" className="press h-12 rounded-full text-base font-semibold hover:bg-brand" onClick={() => router.push("/portal/")}>
              Ir a mi portal
            </Button>
          </div>
        ) : (
          <>
            <ol className="grid gap-4">
              {STEPS.map((s, i) => (
                <li key={s} className="flex items-start gap-3">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border-[1.5px] border-foreground font-display text-xs font-bold">
                    {i === STEPS.length - 1 ? <Check className="size-3.5" aria-hidden /> : `0${i + 1}`}
                  </span>
                  <span className="pt-0.5 text-[15.5px] leading-snug text-ink-2">{s}</span>
                </li>
              ))}
            </ol>

            <Button
              type="button"
              size="lg"
              disabled={busy}
              onClick={onGoogle}
              className="press mt-8 h-13 w-full rounded-full text-base font-semibold hover:bg-brand"
            >
              {busy ? <Loader2 className="animate-spin" aria-hidden /> : <FaGoogle aria-hidden />}
              Continuar con Google
            </Button>

            <p role="status" aria-live="polite" className="mt-4 min-h-5 text-sm">
              {error && <span className="text-destructive">{error}</span>}
              {info && (
                <span className="text-ink-2">
                  {info}{" "}
                  <a href={wa("Hola NextDigital! Quiero saber el estado de mi proyecto.")} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline underline-offset-4">
                    Abrir WhatsApp
                  </a>
                </span>
              )}
            </p>
          </>
        )}
      </motion.div>
    </section>
  )
}
