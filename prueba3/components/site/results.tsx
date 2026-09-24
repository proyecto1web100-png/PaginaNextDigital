"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Check, MessageCircle } from "lucide-react"
import { FeatCard } from "@/components/ui/agent-bento-grid"
import { Badge } from "@/components/ui/badge"
import { Tag } from "@/components/ui/tag"
import { PROJECTS, asset } from "@/lib/site"
import { cn } from "@/lib/utils"
import { SectionHead } from "./section-head"
import { gentle, inView } from "./motion"

/* ── Visuals ──────────────────────────────────────────────── */

function BookingsVisual() {
  const reduce = useReducedMotion()
  const bars = [
    { label: "Antes", value: 100, tone: "bg-paper-2", note: "Base" },
    { label: "Con la web", value: 140, tone: "bg-brand", note: "+40%" },
  ]
  return (
    <div className="flex h-full items-end justify-center gap-6 px-6 pb-5 pt-8">
      {bars.map((b) => (
        <div key={b.label} className="flex h-full w-16 flex-col items-center justify-end gap-2">
          <span className="font-display text-sm font-bold">{b.note}</span>
          <motion.div
            className={cn("w-full origin-bottom rounded-lg", b.tone)}
            style={{ height: `${(b.value / 140) * 100}%` }}
            initial={reduce ? false : { scaleY: 0.2, opacity: 0 }}
            whileInView={{ scaleY: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={gentle}
          />
          <span className="text-[11px] text-muted-foreground">{b.label}</span>
        </div>
      ))}
    </div>
  )
}

const INBOX = [
  { from: "Pedido web", text: "Vestido negro · talla M", time: "9:41", unread: true },
  { from: "Pedido web", text: "Blusa blanca ×2", time: "9:12", unread: true },
  { from: "Pedido web", text: "Conjunto casual · talla S", time: "8:57", unread: true },
]

function InboxVisual() {
  const unread = INBOX.filter((m) => m.unread).length
  return (
    <div className="flex h-full flex-col bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="flex items-center gap-2 text-xs font-semibold">
          <MessageCircle className="size-3.5" aria-hidden /> Pedidos por WhatsApp
        </span>
        <Badge className="h-5 min-w-5 rounded-full bg-orange px-1.5 font-mono text-[11px] tabular-nums text-foreground" aria-label={`${unread} sin leer`}>
          {unread}
        </Badge>
      </div>
      <ul className="flex-1 divide-y divide-border">
        {INBOX.map((m, i) => (
          <li key={i} className="flex items-center gap-3 px-4 py-2.5">
            <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", m.unread ? "bg-brand" : "bg-transparent")} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-semibold">{m.text}</span>
              <span className="block text-[10px] text-muted-foreground">{m.from}</span>
            </span>
            <span className="text-[10px] tabular-nums text-muted-foreground">{m.time}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function DeliveryVisual() {
  const steps = [
    { title: "Hablamos", when: "Día 1" },
    { title: "Diseñamos", when: "Día 1–2" },
    { title: "Lanzamos", when: "≤ 48 h" },
  ]
  return (
    <ol className="flex h-full flex-col justify-center gap-3 bg-card px-5 py-4">
      {steps.map((s, i) => {
        const last = i === steps.length - 1
        return (
          <li key={s.title} className="flex items-center gap-3">
            <span
              className={cn(
                "grid size-7 shrink-0 place-items-center rounded-full border-[1.5px] font-display text-xs font-bold",
                last ? "border-foreground bg-foreground text-background" : "border-foreground/70"
              )}
            >
              {last ? <Check className="size-3.5" aria-hidden /> : `0${i + 1}`}
            </span>
            <span className="flex-1 font-display text-base font-bold tracking-tight">{s.title}</span>
            <span className="font-mono text-xs text-muted-foreground">{s.when}</span>
          </li>
        )
      })}
    </ol>
  )
}

function TestimonialVisual() {
  return (
    <figure className="flex h-full flex-col justify-between gap-4 bg-foreground p-5 text-background md:p-6">
      <blockquote className="font-display text-xl font-semibold leading-snug tracking-tight md:text-2xl">
        “NextDigital entendió exactamente lo que necesitaba. Mi catálogo online nos cambió la operación completa.{" "}
        <span className="text-orange">Recuperamos la inversión en la primera semana.</span>”
      </blockquote>
      <figcaption className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm text-background/60">
          <span className="font-semibold text-background">Gaby Flores</span> · Gabys Fashion
        </span>
        <span className="flex gap-2">
          <Tag className="border-white/20 text-background/80">+300% visibilidad</Tag>
          <Tag className="border-white/20 text-background/80">ROI en 1 semana</Tag>
        </span>
      </figcaption>
    </figure>
  )
}

function DevicesVisual() {
  const kenias = PROJECTS[0]
  return (
    <div className="relative flex h-full items-center justify-center overflow-hidden bg-paper-2">
      <div className="absolute left-4 right-14 top-5 overflow-hidden rounded-lg border border-border bg-card shadow-xl">
        <div className="flex h-4 items-center gap-1 border-b border-border bg-paper-2 px-2" aria-hidden>
          <i className="size-1.5 rounded-full bg-black/15" />
          <i className="size-1.5 rounded-full bg-black/15" />
          <i className="size-1.5 rounded-full bg-black/15" />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(kenias.card)} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover object-left-top" />
      </div>
      <div className="absolute bottom-3 right-4 w-[72px] overflow-hidden rounded-xl border-2 border-foreground bg-card shadow-xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset(kenias.card)} alt="" loading="lazy" className="aspect-[9/17] w-full object-cover object-left-top" />
      </div>
    </div>
  )
}

/* ── Section ──────────────────────────────────────────────── */

const CARDS = [
  { title: "Más reservas", description: "Kenias Studio: citas online 24/7 y +40% de reservas.", visual: <BookingsVisual />, className: "lg:col-span-1" },
  { title: "Pedidos que llegan solos", description: "Catálogo que envía cada pedido directo a WhatsApp. Vista de ejemplo.", visual: <InboxVisual />, className: "lg:col-span-1" },
  { title: "En línea en 48 horas", description: "De la primera conversación al sitio publicado.", visual: <DeliveryVisual />, className: "lg:col-span-1" },
  { title: "Lo que dicen nuestros clientes", description: "Resultados medidos por el propio negocio.", visual: <TestimonialVisual />, className: "md:col-span-2 lg:col-span-2" },
  { title: "Perfecta en cualquier pantalla", description: "Diseño responsivo en celular, tablet y computadora.", visual: <DevicesVisual />, className: "lg:col-span-1" },
]

export function Results() {
  return (
    <section id="resultados" aria-labelledby="results-title" className="bg-paper-2">
      <div className="mx-auto w-full max-w-[1180px] px-4 py-20 md:px-8 md:py-28">
        <SectionHead
          id="results-title"
          eyebrow="02 · Resultados"
          title="Una web que trabaja por tu negocio."
          lead="Lo que cambia cuando tus clientes te encuentran, reservan y compran sin tener que esperar a que respondas."
        />

        <motion.div {...inView} className="mt-12 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((c) => (
            <FeatCard
              key={c.title}
              title={c.title}
              description={c.description}
              className={cn("min-h-[280px] rounded-3xl border border-border shadow-none lg:h-[290px]", c.className)}
            >
              {c.visual}
            </FeatCard>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
