"use client"

import { BarChart3, CircleHelp, ClipboardList, CreditCard, LayoutGrid, LogIn, Newspaper } from "lucide-react"
import { NotchNavbar } from "@/components/ui/notch-navbar"
import { home, page } from "@/lib/links"
import { LogoN } from "./logo"

/** `depth`: how many folders below the home page this nav is rendered (see lib/links). */
export function SiteNav({ depth = 0 }: { depth?: number }) {
  // Quote form: the section on the home page, its own page (/cotizar/) everywhere else.
  const quote = depth === 0 ? home(0, "cotizar") : page(depth, "cotizar")
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
        <a href={quote} className="press inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-4 py-1.5 text-sm font-semibold text-background transition-colors hover:bg-orange hover:text-foreground">
          <ClipboardList aria-hidden className="size-4" /> Cotizar
        </a>
      }
      mobileAction={
        <a href={quote} aria-label="Cotizar" className="grid size-9 place-items-center rounded-full text-foreground hover:bg-paper-2">
          <ClipboardList className="size-5" aria-hidden />
        </a>
      }
    />
  )
}
