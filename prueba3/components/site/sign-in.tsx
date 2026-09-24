"use client"

import { useEffect, useId, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { FaApple, FaGoogle } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pill } from "@/components/ui/pill"
import { wa } from "@/lib/site"
import { authErrorMessage, isAuthConfigured, portalUrl, supabase } from "@/lib/supabase"
import { cn } from "@/lib/utils"
import { inView } from "./motion"

type Status = { tone: "info" | "error" | "success"; text: string } | null
type Busy = null | "password" | "google" | "apple" | "reset"

const NOT_CONFIGURED = "El portal de clientes todavía no está conectado. Mientras tanto, escríbenos por WhatsApp."

export function SignIn() {
  const id = useId()
  const router = useRouter()
  const emailRef = useRef<HTMLInputElement>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState<Status>(null)
  const [busy, setBusy] = useState<Busy>(null)
  const [signedInAs, setSignedInAs] = useState<string | null>(null)

  // If there is already a session, offer a shortcut to the portal instead of the form.
  useEffect(() => {
    if (!supabase) return
    supabase.auth.getSession().then(({ data }) => setSignedInAs(data.session?.user.email ?? null))
  }, [])

  const notConfigured = () => setStatus({ tone: "info", text: NOT_CONFIGURED })

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!supabase) return notConfigured()
    const form = new FormData(e.currentTarget)
    setBusy("password")
    setStatus(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")).trim(),
      password: String(form.get("password")),
    })
    if (error) {
      setBusy(null)
      setStatus({ tone: "error", text: authErrorMessage(error) })
      return
    }
    setStatus({ tone: "success", text: "Sesión iniciada. Abriendo tu portal…" })
    router.push("/portal/")
  }

  async function onProvider(provider: "google" | "apple") {
    if (!supabase) return notConfigured()
    setBusy(provider)
    setStatus(null)
    // Redirects away to the provider; on return Supabase lands on /portal/ with the session.
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: portalUrl() } })
    if (error) {
      setBusy(null)
      setStatus({ tone: "error", text: authErrorMessage(error) })
    }
  }

  async function onForgot() {
    if (!supabase) return notConfigured()
    const email = emailRef.current?.value.trim() ?? ""
    if (!email || !emailRef.current?.checkValidity()) {
      setStatus({ tone: "error", text: "Escribe tu correo arriba y vuelve a tocar “¿Olvidaste tu contraseña?”." })
      emailRef.current?.focus()
      return
    }
    setBusy("reset")
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: portalUrl() })
    setBusy(null)
    setStatus(
      error
        ? { tone: "error", text: authErrorMessage(error) }
        : { tone: "success", text: `Si ${email} tiene una cuenta, te enviamos un enlace para crear una contraseña nueva.` }
    )
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
            <div className="grid gap-3">
              {(["google", "apple"] as const).map((p) => (
                <Button
                  key={p}
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={busy !== null}
                  onClick={() => onProvider(p)}
                  className="press h-12 rounded-full border-[1.5px] border-foreground bg-transparent font-semibold hover:bg-foreground hover:text-background"
                >
                  {busy === p ? <Loader2 className="animate-spin" aria-hidden /> : p === "google" ? <FaGoogle aria-hidden /> : <FaApple aria-hidden />}
                  {p === "google" ? "Continue with Google" : "Continue with Apple"}
                </Button>
              ))}
            </div>

            <div className="my-6 flex items-center gap-3" role="separator" aria-label="or">
              <span className="h-px flex-1 bg-border" />
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">or</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <form className="grid gap-5" onSubmit={onSubmit} aria-busy={busy === "password"}>
              <div className="grid gap-2">
                <Label htmlFor={`${id}-email`}>Email</Label>
                <Input
                  ref={emailRef}
                  id={`${id}-email`}
                  name="email"
                  type="email"
                  autoComplete="username"
                  inputMode="email"
                  required
                  placeholder="tu@negocio.com"
                  className="h-12 rounded-xl bg-background/60"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${id}-password`}>Password</Label>
                  <button
                    type="button"
                    onClick={onForgot}
                    disabled={busy !== null}
                    className="text-[13px] font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline disabled:opacity-50"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id={`${id}-password`}
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="h-12 rounded-xl bg-background/60 pr-12"
                  />
                  <button
                    type="button"
                    aria-label="Show password"
                    aria-pressed={showPassword}
                    aria-controls={`${id}-password`}
                    onClick={() => setShowPassword((v) => !v)}
                    className="press absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-paper-2 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
                  >
                    {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
                  </button>
                </div>
              </div>

              <Button type="submit" size="lg" disabled={busy !== null} className="press h-12 rounded-full text-base font-semibold hover:bg-brand">
                {busy === "password" && <Loader2 className="animate-spin" aria-hidden />}
                Sign in
              </Button>

              <p
                role="status"
                aria-live="polite"
                className={cn(
                  "min-h-5 text-sm",
                  status?.tone === "error" ? "text-destructive" : status?.tone === "success" ? "text-[#10653a]" : "text-ink-2"
                )}
              >
                {status?.text}
                {status && status.text === NOT_CONFIGURED && (
                  <>
                    {" "}
                    <a href={wa("Hola NextDigital! Quiero saber el estado de mi proyecto.")} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline underline-offset-4">
                      Abrir WhatsApp
                    </a>
                  </>
                )}
              </p>
            </form>
          </>
        )}
      </motion.div>
    </section>
  )
}
