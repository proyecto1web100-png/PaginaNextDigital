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
  /** Starting price ("desde"): the final quote depends on the project. */
  from?: boolean
  tag?: string
  note?: string
  cta?: string
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
    price: "4,000",
    desc: "Tu web con sistemas integrados para gestionar citas, catálogo y contenido.",
    includes: ["Todo lo del plan Básico", "Bases de datos integradas", "Sistemas integrados (citas, catálogo…)", "Panel de administrador"],
    excludes: ["Reportes de clientes y ventas", "Módulo de artículos y ventas"],
    popular: true,
  },
  {
    name: "Avanzado",
    price: "5,000",
    desc: "El sistema completo: ventas, reportes, inventario y dashboard de administración.",
    includes: ["Todo lo del plan Intermedio", "Reportes de clientes y artículos", "Módulo completo de ventas", "Dashboard completo de administración"],
  },
  {
    name: "Negocios",
    price: "5,000",
    from: true,
    tag: "Empresas",
    desc: "Para empresas más grandes que necesitan sistemas a la medida y una asesoría más cercana.",
    includes: ["Todo lo del plan Avanzado", "Asesoría personalizada", "Sistemas a la medida de tu empresa", "Soporte prioritario"],
    note: "Según el proyecto · 50% / 50%",
    cta: "Hablar con un asesor",
  },
]

/** Optional monthly maintenance (Básico, Intermedio and Avanzado; Negocios is quoted). */
const MAINTENANCE = { price: "500", items: ["Actualizaciones de contenido", "Soporte y correcciones", "Revisión mensual de tu página"] }

export function Plans() {
  return (
    <section id="planes" aria-labelledby="plans-title" className="mx-auto w-full max-w-[1180px] px-4 py-20 md:px-8 md:py-28">
      <SectionHead
        id="plans-title"
        eyebrow="03 · Planes"
        title={<>Inversión clara,<br />sin sorpresas.</>}
        lead="Pagas 50% al iniciar y 50% al entregar. Todos los planes incluyen diseño a medida y entrega rápida."
      />

      <motion.div {...inView} className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((p) => (
          <article
            key={p.name}
            className={cn(
              "relative flex flex-col rounded-3xl border p-7",
              p.popular ? "border-foreground bg-foreground text-background" : p.tag ? "border-brand/50 bg-card ring-1 ring-brand/20" : "border-border bg-card"
            )}
          >
            {p.popular && (
              <span className="absolute right-6 top-6 rounded-full bg-orange px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-foreground">
                Más popular
              </span>
            )}
            {p.tag && (
              <span className="absolute right-6 top-6 rounded-full bg-brand px-3 py-1 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-white">
                {p.tag}
              </span>
            )}
            <h3 className={cn("font-sans text-[15px] font-semibold tracking-normal", p.popular ? "text-background/60" : "text-muted-foreground")}>
              {p.name}
            </h3>
            <p className="mt-3 font-display text-[clamp(2.6rem,4vw,3.2rem)] font-extrabold leading-none tracking-[-0.04em]">
              {p.from && <span className="mr-2 align-[0.9em] text-[0.3em] font-semibold tracking-normal text-muted-foreground">Desde</span>}
              <span className="mr-1 align-[0.6em] text-[0.45em] font-semibold tracking-normal">L.</span>
              {p.price}
            </p>
            <p className={cn("mt-2 text-sm", p.popular ? "text-background/60" : "text-muted-foreground")}>{p.note ?? "Pago único · 50% / 50%"}</p>
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
              href={wa(
                p.from
                  ? `Hola NextDigital! Me interesa el plan ${p.name} para mi empresa y quisiera una asesoría.`
                  : `Hola NextDigital! Me interesa el plan ${p.name} (L. ${p.price}) para mi negocio.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "press mt-auto inline-flex h-12 items-center justify-center gap-2 rounded-full border-[1.5px] text-[15px] font-semibold transition-colors",
                p.popular
                  ? "border-orange bg-orange text-foreground hover:bg-background hover:border-background"
                  : "border-foreground hover:bg-foreground hover:text-background"
              )}
            >
              <FaWhatsapp aria-hidden /> {p.cta ?? `Elegir ${p.name}`}
            </a>
          </article>
        ))}
      </motion.div>

      <motion.div
        {...inView}
        className="mt-4 flex flex-col gap-4 rounded-3xl border border-border bg-card px-6 py-5 md:flex-row md:items-center md:justify-between md:px-7"
      >
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Mantenimiento mensual · opcional</p>
          <p className="mt-1 font-display text-3xl font-extrabold tracking-[-0.03em]">
            L. {MAINTENANCE.price} <span className="font-sans text-sm font-medium tracking-normal text-muted-foreground">/mes</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">En el plan Negocios se cotiza según el proyecto.</p>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-[15px] text-ink-2">
          {MAINTENANCE.items.map((t) => (
            <li key={t} className="inline-flex items-center gap-2">
              <Check className="size-4 text-brand" aria-hidden />
              {t}
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  )
}
