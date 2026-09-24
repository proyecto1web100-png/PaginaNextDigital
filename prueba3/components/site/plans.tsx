"use client"

import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { wa } from "@/lib/site"
import { cn } from "@/lib/utils"
import { SectionHead } from "./section-head"
import { inView } from "./motion"

type Plan = {
  name: string
  price: string
  desc: string
  includes: string[]
  excludes?: string[]
  popular?: boolean
}

const PLANS: Plan[] = [
  {
    name: "Básico",
    price: "2,500",
    desc: "Una landing page elegante para presentar tu negocio y recibir clientes por WhatsApp.",
    includes: ["Landing page de presentación", "Diseño responsivo (móvil y escritorio)", "Botones de WhatsApp y redes sociales", "Entrega en 48 horas"],
    excludes: ["Bases de datos y sistemas", "Panel de administrador"],
  },
  {
    name: "Intermedio",
    price: "3,500",
    desc: "Tu web con sistemas integrados para gestionar citas, catálogo y contenido.",
    includes: ["Todo lo del plan Básico", "Bases de datos integradas", "Sistemas integrados (citas, catálogo…)", "Panel de administrador"],
    excludes: ["Reportes de clientes y ventas", "Módulo de artículos y ventas"],
    popular: true,
  },
  {
    name: "Avanzado",
    price: "4,250",
    desc: "El sistema completo: ventas, reportes, inventario y dashboard de administración.",
    includes: ["Todo lo del plan Intermedio", "Reportes de clientes y artículos", "Módulo completo de ventas", "Dashboard completo de administración"],
  },
]

const MONTHLY = [
  { name: "Básica", price: "250", items: [{ t: "Hosting incluido", ok: true }, { t: "Sin mantenimiento", ok: false }] },
  { name: "Avanzada", price: "300", items: [{ t: "Hosting incluido", ok: true }, { t: "Mantenimiento mensual", ok: true }, { t: "Actualizaciones", ok: true }] },
]

export function Plans() {
  return (
    <section id="planes" aria-labelledby="plans-title" className="mx-auto w-full max-w-[1180px] px-4 py-20 md:px-8 md:py-28">
      <SectionHead
        id="plans-title"
        eyebrow="03 · Planes"
        title={<>Inversión clara,<br />sin sorpresas.</>}
        lead="Pagas 50% al iniciar y 50% al entregar. Todos los planes incluyen diseño a medida y entrega rápida."
      />

      <motion.div {...inView} className="mt-12 grid gap-4 md:grid-cols-3">
        {PLANS.map((p) => (
          <article
            key={p.name}
            className={cn(
              "relative flex flex-col rounded-3xl border p-7",
              p.popular ? "border-foreground bg-foreground text-background" : "border-border bg-card"
            )}
          >
            {p.popular && (
              <span className="absolute right-6 top-6 rounded-full bg-orange px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-foreground">
                Más popular
              </span>
            )}
            <h3 className={cn("font-sans text-[15px] font-semibold tracking-normal", p.popular ? "text-background/60" : "text-muted-foreground")}>
              {p.name}
            </h3>
            <p className="mt-3 font-display text-[clamp(2.6rem,4vw,3.2rem)] font-extrabold leading-none tracking-[-0.04em]">
              <span className="mr-1 align-[0.6em] text-[0.45em] font-semibold tracking-normal">L.</span>
              {p.price}
            </p>
            <p className={cn("mt-2 text-sm", p.popular ? "text-background/60" : "text-muted-foreground")}>Pago único · 50% / 50%</p>
            <p className={cn("mt-5 border-b pb-5 text-[15.5px] leading-relaxed", p.popular ? "border-white/15 text-background/80" : "border-border text-ink-2")}>
              {p.desc}
            </p>
            <ul className="mt-5 mb-7 grid gap-3 text-[15px]">
              {p.includes.map((t) => (
                <li key={t} className="flex gap-2.5">
                  <Check className={cn("mt-0.5 size-[18px] shrink-0", p.popular ? "text-orange" : "text-brand")} aria-hidden />
                  {t}
                </li>
              ))}
              {p.excludes?.map((t) => (
                <li key={t} className={cn("flex gap-2.5 line-through decoration-current/40", p.popular ? "text-background/45" : "text-muted-foreground")}>
                  <X className="mt-0.5 size-[18px] shrink-0" aria-hidden />
                  <span><span className="sr-only">No incluye: </span>{t}</span>
                </li>
              ))}
            </ul>
            <a
              href={wa(`Hola NextDigital! Me interesa el plan ${p.name} (L. ${p.price}) para mi negocio.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "press mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-full border-[1.5px] text-[15px] font-semibold transition-colors",
                p.popular
                  ? "border-orange bg-orange text-foreground hover:bg-background hover:border-background"
                  : "border-foreground hover:bg-foreground hover:text-background"
              )}
            >
              <FaWhatsapp aria-hidden /> Elegir {p.name}
            </a>
          </article>
        ))}
      </motion.div>

      <motion.div {...inView} className="mt-4 grid gap-4 md:grid-cols-[auto_1fr_1fr] md:items-stretch">
        <p className="self-center pr-3 text-sm font-semibold text-muted-foreground">
          Mensualidad
          <br className="hidden md:block" /> (todos los planes)
        </p>
        {MONTHLY.map((m) => (
          <div key={m.name} className="flex flex-wrap items-center justify-between gap-x-5 gap-y-2 rounded-2xl border border-border bg-card px-5 py-4">
            <span className="font-semibold">{m.name}</span>
            <span className="font-display text-2xl font-extrabold tracking-[-0.03em]">
              L. {m.price} <span className="font-sans text-sm font-medium tracking-normal text-muted-foreground">/mes</span>
            </span>
            <ul className="flex w-full flex-wrap gap-x-4 gap-y-1 text-sm text-ink-2">
              {m.items.map((it) => (
                <li key={it.t} className={cn("inline-flex items-center gap-1.5", !it.ok && "text-muted-foreground")}>
                  {it.ok ? <Check className="size-4 text-brand" aria-hidden /> : <X className="size-4" aria-hidden />}
                  {it.t}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
