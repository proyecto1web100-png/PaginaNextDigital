"use client"

import { motion } from "framer-motion"
import { Phone } from "lucide-react"
import { FaInstagram, FaWhatsapp } from "react-icons/fa"
import { GlassDock } from "@/components/ui/glass-dock"
import { INSTAGRAM, PHONE, PHONE_DISPLAY, wa } from "@/lib/site"
import { inView } from "./motion"

const SOCIAL = [
  { title: "Instagram", icon: FaInstagram, href: INSTAGRAM },
  { title: "WhatsApp", icon: FaWhatsapp, href: wa("Hola NextDigital! Quiero una página web para mi negocio.") },
  { title: "Llamar", icon: Phone, href: `tel:+${PHONE}` },
]

/** Floating social dock (VengeanceUI GlassDock). */
export function SocialDock() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center md:bottom-6">
      <GlassDock items={SOCIAL} aria-label="Redes sociales" className="pointer-events-auto" dockClassName="gap-3 px-4 py-2.5 bg-black/70" />
    </div>
  )
}

export function Contact() {
  return (
    <section id="contacto" aria-labelledby="contact-title" className="mx-auto w-full max-w-6xl px-4 pb-40 pt-20 md:px-8 md:pt-28">
      <motion.div {...inView} className="rounded-[32px] border border-white/[0.08] bg-[radial-gradient(80%_120%_at_50%_0%,rgba(59,130,246,0.16),transparent_60%)] px-6 py-16 text-center md:px-16 md:py-24">
        <h2 id="contact-title" className="mx-auto max-w-2xl text-4xl font-semibold tracking-[-0.035em] md:text-6xl">
          Tu negocio merece estar en digital.
        </h2>
        <p className="mx-auto mt-5 max-w-md text-foreground/60">
          Escríbenos hoy y en menos de 24 horas te enviamos una propuesta personalizada, sin compromiso.
        </p>
        <a
          href={wa("Hola NextDigital! Quiero una cotización para mi página web.")}
          target="_blank"
          rel="noopener noreferrer"
          className="press mt-9 inline-flex h-12 items-center gap-2.5 rounded-full bg-white px-7 font-medium text-black transition-colors hover:bg-white/90"
        >
          <FaWhatsapp className="size-5" aria-hidden /> Cotizar por WhatsApp
        </a>
      </motion.div>

      <footer className="mt-16 flex flex-col items-center justify-between gap-2 text-sm text-foreground/40 md:flex-row">
        <span>© {new Date().getFullYear()} NextDigital · Honduras</span>
        <a href={`tel:+${PHONE}`} className="hover:text-foreground/70">{PHONE_DISPLAY}</a>
      </footer>
    </section>
  )
}
