"use client"

import { BarChart3, Home, LayoutGrid, LogIn, MessageCircle } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { NotchNavbar } from "@/components/ui/notch-navbar"
import { wa } from "@/lib/site"

const QUOTE = wa("Hola NextDigital! Quiero una cotización para mi página web.")

export function SiteNav() {
  return (
    <NotchNavbar
      left={[
        { label: "Inicio", href: "#inicio", icon: Home },
        { label: "Portafolio", href: "#portafolio", icon: LayoutGrid },
        { label: "Resultados", href: "#resultados", icon: BarChart3 },
      ]}
      right={[
        { label: "Acceso", href: "#acceso", icon: LogIn },
        { label: "Contacto", href: "#contacto", icon: MessageCircle },
      ]}
      logo={
        <a href="#inicio" aria-label="NextDigital, ir al inicio" className="press grid size-8 place-items-center rounded-[10px] bg-white text-[13px] font-bold tracking-tight text-black">
          nd
        </a>
      }
      actions={
        <a href={QUOTE} target="_blank" rel="noopener noreferrer" className="press inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-3.5 py-1.5 text-sm font-medium text-black transition-colors hover:bg-white/90">
          <FaWhatsapp aria-hidden /> Cotizar
        </a>
      }
      mobileAction={
        <a href={QUOTE} target="_blank" rel="noopener noreferrer" aria-label="Cotizar por WhatsApp" className="grid size-9 place-items-center rounded-full text-foreground/80 hover:bg-white/5 hover:text-foreground">
          <FaWhatsapp className="size-5" aria-hidden />
        </a>
      }
    />
  )
}
