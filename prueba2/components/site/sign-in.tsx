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
    <section id="acceso" aria-labelledby="signin-title" className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 md:grid-cols-2 md:px-8 md:py-28">
      <motion.div {...inView} className="max-w-md">
        <p className="text-sm font-medium text-brand">Portal de clientes</p>
        <h2 id="signin-title" className="mt-2 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
          Tu proyecto, en un solo lugar.
        </h2>
        <p className="mt-4 text-foreground/60">
          Revisa el avance de tu web, tus pagos y tus solicitudes de cambios.
        </p>
        <Pill tone="brand" className="mt-6">Próximamente</Pill>
      </motion.div>

      <motion.div {...inView} className="w-full max-w-md rounded-[28px] border border-white/[0.08] bg-card p-6 shadow-[0_20px_40px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.06)] md:ml-auto md:p-8">
        <div className="grid gap-3">
          <Button type="button" variant="outline" size="lg" className="press h-12 rounded-xl" onClick={() => setStatus(PENDING)}>
            <FaGoogle aria-hidden /> Continue with Google
          </Button>
          <Button type="button" variant="outline" size="lg" className="press h-12 rounded-xl" onClick={() => setStatus(PENDING)}>
            <FaApple aria-hidden /> Continue with Apple
          </Button>
        </div>

        <div className="my-6 flex items-center gap-3" role="separator" aria-label="or">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-xs uppercase tracking-[0.12em] text-foreground/40">or</span>
          <span className="h-px flex-1 bg-white/10" />
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
              className="h-12 rounded-xl"
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
                className="h-12 rounded-xl pr-12"
              />
              <button
                type="button"
                aria-label="Show password"
                aria-pressed={showPassword}
                aria-controls={`${id}-password`}
                onClick={() => setShowPassword((v) => !v)}
                className="press absolute right-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-lg text-foreground/60 transition-colors hover:bg-white/5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand"
              >
                {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
              </button>
            </div>
          </div>

          <Button type="submit" size="lg" className="press h-12 rounded-xl text-base">
            Sign in
          </Button>

          <p role="status" aria-live="polite" className="min-h-5 text-sm text-foreground/60">
            {status && (
              <>
                {status}{" "}
                <a href={wa("Hola NextDigital! Quiero saber el estado de mi proyecto.")} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-300 underline-offset-4 hover:underline">
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
