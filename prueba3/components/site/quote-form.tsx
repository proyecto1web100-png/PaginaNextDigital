"use client"

import { useId, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Loader2, Send } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { page } from "@/lib/links"
import { wa } from "@/lib/site"
import { supabase } from "@/lib/supabase"
import { track } from "@/lib/track"
import { SectionHead } from "./section-head"
import { inView } from "./motion"

const BUSINESS_TYPES = ["Restaurante o cafetería", "Salón o barbería", "Tienda", "Clínica o consultorio", "Servicios profesionales", "Otro"]
const PLANS = ["No sé", "Básico", "Intermedio", "Avanzado"] as const

type Lead = { name: string; phone: string; business_name: string; business_type: string; plan: string; message: string }

const waMessage = (l: Lead) =>
  [
    `Hola NextDigital! Soy ${l.name}${l.business_name ? ` de ${l.business_name}` : ""}.`,
    l.business_type ? `Tipo de negocio: ${l.business_type}.` : "",
    l.plan && l.plan !== "No sé" ? `Me interesa el plan ${l.plan}.` : "Quiero una cotización para mi página web.",
    l.message ? `\n${l.message}` : "",
  ]
    .filter(Boolean)
    .join(" ")

const field = "h-12 rounded-xl bg-background/60"
const select =
  "h-12 w-full rounded-xl border border-input bg-background/60 px-3 text-[15px] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"

export function QuoteForm() {
  const id = useId()
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState<Lead | null>(null)
  const [error, setError] = useState<{ text: string; lead: Lead } | null>(null)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    // Honeypot: real people never fill this hidden field.
    if (String(f.get("website") ?? "")) return
    const lead: Lead = {
      name: String(f.get("name")).trim(),
      phone: String(f.get("phone")).trim(),
      business_name: String(f.get("business_name")).trim(),
      business_type: String(f.get("business_type")),
      plan: String(f.get("plan")),
      message: String(f.get("message")).trim(),
    }
    if (!supabase) {
      setError({ text: "No pudimos guardar tu solicitud aquí, pero puedes enviarla por WhatsApp.", lead })
      return
    }
    setBusy(true)
    setError(null)
    const { error } = await supabase.from("leads").insert({
      name: lead.name,
      phone: lead.phone,
      business_name: lead.business_name || null,
      business_type: lead.business_type || null,
      plan: lead.plan || null,
      message: lead.message || null,
    })
    setBusy(false)
    if (error) {
      setError({ text: "No pudimos guardar tu solicitud. Revisa tu número o envíala por WhatsApp.", lead })
      return
    }
    track("quote")
    setSent(lead)
  }

  return (
    <section id="cotizar" aria-labelledby="quote-title" className="bg-paper-2">
      <div className="mx-auto grid w-full max-w-[1180px] gap-12 px-4 py-20 md:grid-cols-[1fr_1.1fr] md:px-8 md:py-28">
        <SectionHead
          id="quote-title"
          eyebrow="04 · Cotizar"
          title={<>Cuéntanos de<br />tu negocio.</>}
          lead="Déjanos tus datos y te enviamos una propuesta en menos de 24 horas, sin compromiso."
          className="md:grid-cols-1 md:items-start md:gap-6"
        />

        <motion.div {...inView} className="rounded-[28px] border border-border bg-card p-6 shadow-[0_30px_60px_-30px_rgba(18,18,18,0.3)] md:p-8">
          {sent ? (
            <div className="grid gap-4" role="status">
              <CheckCircle2 className="size-10 text-[#10653a]" aria-hidden />
              <p className="font-display text-2xl font-bold leading-tight">¡Gracias, {sent.name.split(/\s+/)[0]}! Recibimos tu solicitud.</p>
              <p className="text-ink-2">Te escribimos al {sent.phone} en menos de 24 horas. Si quieres una respuesta más rápida, envíanos también un WhatsApp:</p>
              <a
                href={wa(waMessage(sent))}
                target="_blank"
                rel="noopener noreferrer"
                className="press inline-flex h-12 w-fit items-center gap-2 rounded-full bg-[#1faf54] px-6 font-semibold text-white"
              >
                <FaWhatsapp aria-hidden /> Enviar por WhatsApp
              </a>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor={`${id}-name`}>Tu nombre</Label>
                  <Input id={`${id}-name`} name="name" required minLength={2} maxLength={120} autoComplete="name" className={field} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`${id}-phone`}>WhatsApp o teléfono</Label>
                  <Input
                    id={`${id}-phone`}
                    name="phone"
                    type="tel"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    minLength={7}
                    maxLength={30}
                    pattern="[0-9+\(\) .\-]{7,30}"
                    title="Solo números, espacios y + ( ) -"
                    placeholder="+504 9999-9999"
                    className={field}
                  />
                </div>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor={`${id}-business`}>
                    Negocio <span className="font-normal text-muted-foreground">(opcional)</span>
                  </Label>
                  <Input id={`${id}-business`} name="business_name" maxLength={120} autoComplete="organization" className={field} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor={`${id}-type`}>Tipo de negocio</Label>
                  <select id={`${id}-type`} name="business_type" defaultValue="" className={select}>
                    <option value="">Elegir…</option>
                    {BUSINESS_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <fieldset className="grid gap-2">
                <legend className="mb-2 text-sm font-medium">Plan de interés</legend>
                <div className="flex flex-wrap gap-2">
                  {PLANS.map((p) => (
                    <label key={p} className="cursor-pointer">
                      <input type="radio" name="plan" value={p} defaultChecked={p === "No sé"} className="peer sr-only" />
                      <span className="inline-flex h-10 items-center rounded-full border-[1.5px] border-border px-4 text-sm font-semibold transition-colors peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50">
                        {p}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-2">
                <Label htmlFor={`${id}-message`}>
                  ¿Qué necesitas? <span className="font-normal text-muted-foreground">(opcional)</span>
                </Label>
                <textarea
                  id={`${id}-message`}
                  name="message"
                  rows={3}
                  maxLength={1000}
                  placeholder="Ej. Quiero mostrar mi menú y recibir pedidos por WhatsApp"
                  className="w-full rounded-xl border border-input bg-background/60 px-3 py-3 text-[15px] outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                />
              </div>
              {/* Honeypot, hidden from people and assistive tech */}
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <label>
                  No llenar
                  <input name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>
              <label className="flex items-start gap-3 text-sm text-ink-2">
                <input type="checkbox" required className="mt-0.5 size-4 shrink-0 accent-orange" />
                <span>
                  Acepto que NextDigital use estos datos para responder mi cotización, según la{" "}
                  <a href={page(0, "privacidad")} className="font-semibold text-foreground underline underline-offset-4">política de privacidad</a>.
                </span>
              </label>
              <Button type="submit" size="lg" disabled={busy} className="press h-12 rounded-full text-base font-semibold hover:bg-brand">
                {busy ? <Loader2 className="animate-spin" aria-hidden /> : <Send aria-hidden />} Enviar solicitud
              </Button>
              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error.text}{" "}
                  <a href={wa(waMessage(error.lead))} target="_blank" rel="noopener noreferrer" className="font-semibold underline underline-offset-4">
                    Enviar por WhatsApp
                  </a>
                </p>
              )}
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
