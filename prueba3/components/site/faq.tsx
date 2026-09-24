"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { FAQS } from "@/lib/faq"
import { wa } from "@/lib/site"
import { SectionHead } from "./section-head"
import { inView } from "./motion"

export function FaqSection() {
  return (
    <section id="preguntas" aria-labelledby="faq-title" className="mx-auto w-full max-w-[1180px] px-4 py-20 md:px-8 md:py-28">
      <SectionHead
        id="faq-title"
        eyebrow="05 · Preguntas"
        title={<>Resolvemos<br />tus dudas.</>}
        lead={
          <>
            ¿Tienes otra pregunta?{" "}
            <a
              href={wa("Hola NextDigital! Tengo una pregunta.")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground underline decoration-orange decoration-2 underline-offset-4"
            >
              Escríbenos por WhatsApp
            </a>
            .
          </>
        }
      />
      <motion.div {...inView} className="mt-10 border-t border-border">
        {FAQS.map((f) => (
          <details key={f.q} className="group border-b border-border">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 font-display text-[clamp(1.1rem,2vw,1.4rem)] font-semibold leading-snug tracking-tight transition-colors hover:text-brand [&::-webkit-details-marker]:hidden">
              {f.q}
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-full border-[1.5px] border-current transition-transform duration-300 group-open:rotate-45 group-open:border-foreground group-open:bg-foreground group-open:text-background"
              >
                <Plus className="size-4" />
              </span>
            </summary>
            <p className="max-w-[70ch] pb-6 pr-12 text-[17px] leading-relaxed text-ink-2">{f.a}</p>
          </details>
        ))}
      </motion.div>
    </section>
  )
}
