"use client"

import { useId, useState } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff } from "lucide-react"
import { FaApple, FaGoogle } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Pill } from "@/components/ui/pill"
import { wa } from "@/lib/site"
import { inView } from "./motion"

// The client portal has no backend yet: submitting validates natively and
// explains how to reach us instead of pretending to sign in.
const PENDING = "El portal de clientes estará disponible pronto. Mientras tanto, escríbenos por WhatsApp."

export function SignIn() {
  const id = useId()
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState("")

  return (
    <section id="acceso" aria-labelledby="signin-title" className="mx-auto grid w-full max-w-[1180px] gap-12 px-4 py-20 md:grid-cols-2 md:items-center md:px-8 md:py-28">
      <motion.div {...inView} className="max-w-md">
        <p className="flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          <span aria-hidden className="h-px w-7 bg-current" />
          03 · Portal de clientes
        </p>
        <h2 id="signin-title" className="mt-4 text-[clamp(2.3rem,5.4vw,4.4rem)] font-bold leading-[1.02]">
          Tu proyecto, en un solo lugar.
        </h2>
        <p className="mt-5 text-[17px] leading-relaxed text-ink-2 md:text-lg">
          Revisa el avance de tu web, tus pagos y tus solicitudes de cambios.
        </p>
        <Pill tone="brand" className="mt-6">Próximamente</Pill>
      </motion.div>

      <motion.div {...inView} className="w-full max-w-md rounded-[28px] border border-border bg-card p-6 shadow-[0_30px_60px_-30px_rgba(18,18,18,0.3)] md:ml-auto md:p-8">
        <div className="grid gap-3">
          <Button type="button" variant="outline" size="lg" className="press h-12 rounded-full border-[1.5px] border-foreground bg-transparent font-semibold hover:bg-foreground hover:text-background" onClick={() => setStatus(PENDING)}>
            <FaGoogle aria-hidden /> Continue with Google
          </Button>
          <Button type="button" variant="outline" size="lg" className="press h-12 rounded-full border-[1.5px] border-foreground bg-transparent font-semibold hover:bg-foreground hover:text-background" onClick={() => setStatus(PENDING)}>
            <FaApple aria-hidden /> Continue with Apple
          </Button>
        </div>

        <div className="my-6 flex items-center gap-3" role="separator" aria-label="or">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <form
          className="grid gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            setStatus(PENDING)
          }}
        >
          <div className="grid gap-2">
            <Label htmlFor={`${id}-email`}>Email</Label>
            <Input
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
            <Label htmlFor={`${id}-password`}>Password</Label>
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

          <Button type="submit" size="lg" className="press h-12 rounded-full text-base font-semibold hover:bg-brand">
            Sign in
          </Button>

          <p role="status" aria-live="polite" className="min-h-5 text-sm text-ink-2">
            {status && (
              <>
                {status}{" "}
                <a href={wa("Hola NextDigital! Quiero saber el estado de mi proyecto.")} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline underline-offset-4">
                  Abrir WhatsApp
                </a>
              </>
            )}
          </p>
        </form>
      </motion.div>
    </section>
  )
}
