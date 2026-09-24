"use client"

import { motion } from "framer-motion"
import { Phone } from "lucide-react"
import { FaInstagram, FaWhatsapp } from "react-icons/fa"
import { GlassDock } from "@/components/ui/glass-dock"
import { INSTAGRAM, PHONE, wa } from "@/lib/site"
import { track } from "@/lib/track"
import { inView } from "./motion"

const SOCIAL = [
  { title: "Instagram", icon: FaInstagram, href: INSTAGRAM },
  {
    title: "WhatsApp",
    icon: FaWhatsapp,
    // The dock opens links with window.open, so count the tap here.
    onClick: () => {
      track("whatsapp")
      window.open(wa("Hola NextDigital! Quiero una página web para mi negocio."), "_blank", "noopener,noreferrer")
    },
  },
  { title: "Llamar", icon: Phone, href: `tel:+${PHONE}` },
]

/** Floating social dock (VengeanceUI GlassDock). */
export function SocialDock() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center md:bottom-6">
      <GlassDock items={SOCIAL} aria-label="Redes sociales" className="pointer-events-auto" dockClassName="gap-3 px-4 py-2.5 bg-white/85 shadow-[0_16px_40px_-12px_rgba(18,18,18,0.35)]" />
    </div>
  )
}

export function Contact() {
  return (
    <section id="contacto" aria-labelledby="contact-title" className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-4 md:px-8">
      <motion.div
        {...inView}
        className="relative overflow-hidden rounded-[32px] bg-foreground px-6 py-14 text-background md:px-20 md:py-24"
      >
        <span aria-hidden className="absolute -right-24 -top-28 size-56 rounded-full bg-orange md:-bottom-64 md:-right-40 md:top-auto md:size-[520px]" />
        <div className="relative">
          <p className="flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-background/55">
            <span aria-hidden className="h-[2px] w-7 rounded-full bg-orange" />
            ¿Listo para crecer?
          </p>
          <h2 id="contact-title" className="mt-5 max-w-[12ch] text-[clamp(2.6rem,7vw,5.8rem)] font-bold leading-[0.95] tracking-[-0.045em]">
            Tu negocio merece estar en digital.
          </h2>
          <p className="mt-6 max-w-[46ch] text-lg text-background/70">
            Escríbenos hoy y en menos de 24 horas te enviamos una propuesta personalizada, sin compromiso.
          </p>
          <a
            href={wa("Hola NextDigital! Quiero una cotización para mi página web.")}
            target="_blank"
            rel="noopener noreferrer"
            className="press mt-9 inline-flex h-13 items-center gap-2.5 rounded-full bg-background px-7 font-semibold text-foreground transition-colors hover:bg-white"
          >
            <span className="grid size-7 place-items-center rounded-full bg-[#1faf54] text-white">
              <FaWhatsapp className="size-4" aria-hidden />
            </span>
            Cotizar por WhatsApp
          </a>
        </div>
      </motion.div>

    </section>
  )
}
