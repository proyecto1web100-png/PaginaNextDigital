"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"
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
  return (
    <section id="dentico" aria-labelledby="dentico-title" className="mx-auto w-full max-w-[1180px] px-4 py-20 md:px-8 md:py-28">
      <SectionHead
        id="dentico-title"
        eyebrow="Software propio · Dentico"
        title={<>Tu clínica dental,<br />todo en Dentico.</>}
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

      <motion.ul {...inView} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <li key={f.t} className="rounded-3xl border border-border bg-card p-6">
            <h3 className="font-sans text-[15px] font-semibold tracking-normal">{f.t}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-2">{f.d}</p>
          </li>
        ))}
      </motion.ul>

      <motion.div {...inView} className="mt-4 grid gap-4 md:grid-cols-2">
        {VERSIONS.map((v) => (
          <article
            key={v.name}
            className={cn("flex flex-col rounded-3xl border p-7", v.featured ? "border-foreground bg-foreground text-background" : "border-border bg-card")}
          >
            <h3 className={cn("font-sans text-[15px] font-semibold tracking-normal", v.featured ? "text-background/60" : "text-muted-foreground")}>
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

      <motion.ul {...inView} className="mt-4 grid gap-3 rounded-3xl border border-border bg-card px-6 py-6 text-[15px] text-ink-2 md:grid-cols-2 md:px-7">
        {TERMS.map((t) => (
          <li key={t} className="flex gap-2.5">
            <Check className="mt-0.5 size-4 shrink-0 text-brand" aria-hidden />
            {t}
          </li>
        ))}
      </motion.ul>
    </section>
  )
}
