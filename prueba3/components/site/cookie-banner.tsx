"use client"

import { useEffect, useId, useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Cookie } from "lucide-react"
import { Button } from "@/components/ui/button"
import { onConsentChange, onOpenCookieSettings, readConsent, saveConsent } from "@/lib/consent"
import { page } from "@/lib/links"
import { spring } from "./motion"

// Consent lives in localStorage; subscribe so every banner/tracker sees the same value.
const subscribe = (cb: () => void) => {
  const off = onConsentChange(cb)
  window.addEventListener("storage", cb)
  return () => {
    off()
    window.removeEventListener("storage", cb)
  }
}
const snapshot = () => JSON.stringify(readConsent())
const serverSnapshot = () => "pending"

export function CookieBanner({ depth = 0 }: { depth?: number }) {
  const id = useId()
  const stored = useSyncExternalStore(subscribe, snapshot, serverSnapshot)
  const [reopened, setReopened] = useState(false)
  const [custom, setCustom] = useState(false)
  const [analytics, setAnalytics] = useState(true)

  useEffect(() => onOpenCookieSettings(() => {
    setReopened(true)
    setCustom(true)
    setAnalytics(readConsent()?.analytics ?? true)
  }), [])

  // "pending" = server render / before hydration: never flash the banner in static HTML.
  const open = stored !== "pending" && (stored === "null" || reopened)

  const decide = (value: boolean) => {
    saveConsent(value)
    setReopened(false)
    setCustom(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-labelledby={`${id}-title`}
          aria-describedby={`${id}-desc`}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0, transition: spring }}
          exit={{ opacity: 0, y: 12, transition: { duration: 0.12, ease: "easeIn" } }}
          className="fixed inset-x-3 bottom-3 z-[60] rounded-3xl border border-border bg-card p-5 shadow-[0_30px_60px_-20px_rgba(18,18,18,0.45)] md:inset-x-auto md:bottom-6 md:right-6 md:w-[420px] md:p-6"
        >
          <p id={`${id}-title`} className="flex items-center gap-2 font-display text-lg font-bold">
            <Cookie className="size-5 text-orange" aria-hidden /> Cookies y privacidad
          </p>
          <p id={`${id}-desc`} className="mt-2 text-sm leading-relaxed text-ink-2">
            Usamos almacenamiento necesario para que funcione el portal de clientes y, si lo aceptas, estadísticas
            anónimas de visitas para mejorar la página. No usamos publicidad ni vendemos tus datos.{" "}
            <a href={page(depth, "cookies")} className="font-semibold text-foreground underline underline-offset-4">
              Más información
            </a>
          </p>

          {custom && (
            <div className="mt-4 grid gap-3 rounded-2xl bg-paper-2 p-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">Necesarias</p>
                  <p className="text-muted-foreground">Inicio de sesión y tu elección de cookies.</p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-muted-foreground">Siempre activas</span>
              </div>
              <label className="flex cursor-pointer items-start justify-between gap-4">
                <span>
                  <span className="block font-semibold">Estadísticas</span>
                  <span className="block text-muted-foreground">Páginas visitadas y de dónde llegas, sin identificarte.</span>
                </span>
                <input
                  type="checkbox"
                  role="switch"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-1 size-5 shrink-0 accent-orange"
                />
              </label>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {custom ? (
              <Button onClick={() => decide(analytics)} className="press h-10 flex-1 rounded-full font-semibold hover:bg-brand">
                Guardar selección
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={() => decide(false)} className="press h-10 flex-1 rounded-full border-[1.5px] border-foreground bg-transparent font-semibold hover:bg-foreground hover:text-background">
                  Rechazar
                </Button>
                <Button onClick={() => decide(true)} className="press h-10 flex-1 rounded-full font-semibold hover:bg-brand">
                  Aceptar
                </Button>
              </>
            )}
          </div>
          {!custom && (
            <button type="button" onClick={() => setCustom(true)} className="mt-3 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              Configurar
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
