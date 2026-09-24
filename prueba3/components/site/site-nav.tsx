"use client"

import { BarChart3, CircleHelp, CreditCard, LayoutGrid, LogIn, Newspaper } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { NotchNavbar } from "@/components/ui/notch-navbar"
import { home, page } from "@/lib/links"
import { wa } from "@/lib/site"
import { LogoN } from "./logo"

const QUOTE = wa("Hola NextDigital! Quiero una cotización para mi página web.")

/** `depth`: how many folders below the home page this nav is rendered (see lib/links). */
export function SiteNav({ depth = 0 }: { depth?: number }) {
  return (
    <NotchNavbar
      left={[
        { label: "Portafolio", href: home(depth, "portafolio"), icon: LayoutGrid },
        { label: "Resultados", href: home(depth, "resultados"), icon: BarChart3 },
        { label: "Planes", href: home(depth, "planes"), icon: CreditCard },
      ]}
      right={[
        { label: "Preguntas", href: home(depth, "preguntas"), icon: CircleHelp },
        { label: "Blog", href: page(depth, "blog"), icon: Newspaper },
        { label: "Acceso", href: home(depth, "acceso"), icon: LogIn },
      ]}
      logo={
        <a href={home(depth, depth === 0 ? "inicio" : undefined)} aria-label="NextDigital, ir al inicio" className="press grid h-9 place-items-center px-1.5">
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
