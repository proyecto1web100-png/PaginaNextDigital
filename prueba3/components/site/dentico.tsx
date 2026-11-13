"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, ChevronDown } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { asset, wa } from "@/lib/site"
import { cn } from "@/lib/utils"
import { SectionHead } from "./section-head"
import { inView } from "./motion"

const FEATURES = [
  { t: "Agenda", d: "Tu día de un vistazo, con colores por doctor y recordatorios por WhatsApp." },
  { t: "Expediente", d: "Historial clínico de cada paciente en un solo lugar." },
  { t: "Odontograma", d: "Un clic por cara del diente, con notación FDI permanente y temporal." },
  { t: "Firma digital", d: "Consentimientos firmados en la pantalla o en una tablet." },
]

const VERSIONS = [
  {
    name: "Estándar",
    price: "17,500",
    desc: "Lo esencial para llevar tu clínica en orden.",
    includes: ["Agenda", "Expediente", "Odontograma", "Presupuestos", "Consentimientos y firmas"],
  },
  {
    name: "Premium",
    price: "21,000",
    desc: "Todo lo de Estándar, más el control del dinero de tu clínica.",
    includes: ["Todo lo de Estándar", "Facturación", "Caja", "Gastos", "Estado de resultados"],
    featured: true,
  },
]

const TERMS = [
  "Pago único, o en plazos de hasta 3 meses.",
  "Incluye 5 meses de actualizaciones gratis.",
  "Después, la anualidad de actualizaciones es opcional: L. 3,500 al año. Sin ella, Dentico sigue funcionando igual, solo deja de recibir actualizaciones.",
  "Soporte y corrección de errores siempre gratis por WhatsApp.",
]

export function Dentico() {
  const [active, setActive] = useState(1)
  return (
    <section id="dentico" aria-labelledby="dentico-title" className="mx-auto w-full max-w-[1180px] px-4 py-10 md:px-8 md:py-28">
      <SectionHead
        id="dentico-title"
        eyebrow="Software propio · Dentico"
        title={<>Tu clínica dental,<br />todo en{" "}<span className="whitespace-nowrap"><img src={asset("/dentico/logo.png")} alt="" width={256} height={256} className="mx-[0.12em] inline-block size-[0.82em] -translate-y-[0.06em] rounded-[22%] align-middle shadow-[0_8px_24px_-8px_rgba(20,160,190,0.6)]" />Dentico.</span></>}
        lead="Además de páginas web, desarrollamos Dentico: un sistema para clínicas odontológicas que funciona en Windows y Linux."
      />

      <motion.div {...inView} className="mt-12 overflow-hidden rounded-3xl border border-border bg-card">
        <video
          className="aspect-video w-full"
          src={asset("/dentico/dentico.mp4")}
          poster={asset("/dentico/poster.jpg")}
          controls
          muted
          playsInline
          preload="none"
          aria-label="Video de presentación de Dentico"
        />
      </motion.div>

      <motion.ul {...inView} className="mt-4 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <li key={f.t} className="rounded-3xl border border-border bg-card p-4 md:p-6">
            <h3 className="font-sans text-[15px] font-semibold tracking-normal">{f.t}</h3>
            <p className="mt-1.5 text-[13.5px] leading-snug text-ink-2 md:mt-2 md:text-[15px] md:leading-relaxed">{f.d}</p>
          </li>
        ))}
      </motion.ul>

      <div role="tablist" aria-label="Versiones de Dentico" className="mt-8 grid grid-cols-2 gap-1 rounded-full border border-border bg-card p-1 md:hidden">
        {VERSIONS.map((v, i) => (
          <button
            key={v.name}
            type="button"
            role="tab"
            aria-selected={active === i}
            onClick={() => setActive(i)}
            className={cn("h-10 rounded-full text-[15px] font-semibold transition-colors", active === i ? "bg-foreground text-background" : "text-muted-foreground")}
          >
            {v.name}
          </button>
        ))}
      </div>
      <motion.div {...inView} className="mt-3 grid gap-4 md:mt-4 md:grid-cols-2">
        {VERSIONS.map((v, i) => (
          <article
            key={v.name}
            className={cn("flex-col rounded-3xl border p-7 md:flex", active === i ? "flex" : "hidden", v.featured ? "border-foreground bg-foreground text-background" : "border-border bg-card")}
          >
            <h3 className={cn("flex items-center gap-2.5 font-sans text-[15px] font-semibold tracking-normal", v.featured ? "text-background/60" : "text-muted-foreground")}>
              <img src={asset("/dentico/logo.png")} alt="" width={256} height={256} className="size-7 rounded-[22%]" />
              Dentico {v.name}
            </h3>
            <p className="mt-3 font-display text-[clamp(2.6rem,4vw,3.2rem)] font-extrabold leading-none tracking-[-0.04em]">
              <span className="mr-1 align-[0.6em] text-[0.45em] font-semibold tracking-normal">L.</span>
              {v.price}
            </p>
            <p className={cn("mt-2 text-sm", v.featured ? "text-background/60" : "text-muted-foreground")}>Pago único · hasta 3 meses de plazo</p>
            <p className={cn("mt-5 border-b pb-5 text-[15.5px] leading-relaxed", v.featured ? "border-white/15 text-background/80" : "border-border text-ink-2")}>{v.desc}</p>
            <ul className="mt-5 mb-7 grid gap-3 text-[15px]">
              {v.includes.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Check className={cn("mt-0.5 size-[18px] shrink-0", v.featured ? "text-orange" : "text-brand")} aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
            <a
              href={wa(`Hola NextDigital! Me interesa Dentico ${v.name} (L. ${v.price}) para mi clínica.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "press mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-full border-[1.5px] text-[15px] font-semibold transition-colors",
                v.featured ? "border-orange bg-orange text-foreground hover:bg-background hover:border-background" : "border-foreground hover:bg-foreground hover:text-background"
              )}
            >
              <FaWhatsapp aria-hidden /> Quiero Dentico {v.name}
            </a>
          </article>
        ))}
      </motion.div>

      <motion.div {...inView} className="mt-4 rounded-3xl border border-border bg-card">
        <details className="group md:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 text-[15px] font-semibold">
            Pagos, actualizaciones y soporte
            <ChevronDown className="size-5 transition-transform group-open:rotate-180" aria-hidden />
          </summary>
          <ul className="grid gap-3 px-6 pb-6 text-[15px] text-ink-2">
            {TERMS.map((t) => (
              <li key={t} className="flex gap-2.5">
                <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
                {t}
              </li>
            ))}
          </ul>
        </details>
        <ul className="hidden gap-3 px-7 py-6 text-[15px] text-ink-2 md:grid md:grid-cols-2">
          {TERMS.map((t) => (
            <li key={t} className="flex gap-2.5">
              <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  )
}
