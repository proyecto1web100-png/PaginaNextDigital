"use client"

import { BarChart3, CreditCard, Home, LayoutGrid, LogIn, MessageCircle } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { NotchNavbar } from "@/components/ui/notch-navbar"
import { wa } from "@/lib/site"
import { LogoN } from "./logo"

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
        { label: "Planes", href: "#planes", icon: CreditCard },
        { label: "Acceso", href: "#acceso", icon: LogIn },
        { label: "Contacto", href: "#contacto", icon: MessageCircle },
      ]}
      logo={
        <a href="#inicio" aria-label="NextDigital, ir al inicio" className="press grid h-9 place-items-center px-1.5">
          <LogoN className="-translate-y-[3px] text-[30px]" />
        </a>
      }
      actions={
        <a href={QUOTE} target="_blank" rel="noopener noreferrer" className="press inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-1.5 text-sm font-semibold text-background transition-colors hover:bg-orange hover:text-foreground">
          <FaWhatsapp aria-hidden /> Cotizar
        </a>
      }
      mobileAction={
        <a href={QUOTE} target="_blank" rel="noopener noreferrer" aria-label="Cotizar por WhatsApp" className="grid size-9 place-items-center rounded-full text-foreground hover:bg-paper-2">
          <FaWhatsapp className="size-5" aria-hidden />
        </a>
      }
    />
  )
}
