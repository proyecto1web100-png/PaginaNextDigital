"use client"

import { home, page } from "@/lib/links"
import { PHONE, PHONE_DISPLAY } from "@/lib/site"
import { openCookieSettings } from "@/lib/consent"
import { LogoN } from "./logo"

export function SiteFooter({ depth = 0 }: { depth?: number }) {
  const link = "hover:text-foreground"
  return (
    <footer className="mx-auto w-full max-w-[1180px] px-4 pb-36 md:px-8">
      <div className="grid gap-8 border-t border-border pt-8 text-sm text-muted-foreground md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <a href={home(depth)} className="inline-flex items-center gap-2 text-foreground" aria-label="NextDigital, inicio">
            <LogoN className="text-2xl" />
            <span className="font-display text-lg font-bold tracking-tight">NextDigital</span>
          </a>
          <p className="mt-3 max-w-[32ch]">Páginas web profesionales para negocios en Honduras.</p>
        </div>
        <nav aria-label="Enlaces" className="grid content-start gap-2">
          <a className={link} href={home(depth, "planes")}>Planes</a>
          <a className={link} href={home(depth, "cotizar")}>Cotizar</a>
          <a className={link} href={home(depth, "preguntas")}>Preguntas frecuentes</a>
          <a className={link} href={page(depth, "blog")}>Blog</a>
        </nav>
        <nav aria-label="Legal y contacto" className="grid content-start gap-2">
          <a className={link} href={`tel:+${PHONE}`}>{PHONE_DISPLAY}</a>
          <a className={link} href={page(depth, "privacidad")}>Política de privacidad</a>
          <a className={link} href={page(depth, "cookies")}>Política de cookies</a>
          <button type="button" onClick={openCookieSettings} className={`w-fit text-left ${link}`}>
            Preferencias de cookies
          </button>
        </nav>
      </div>
      <p className="mt-8 text-xs text-muted-foreground">© {new Date().getFullYear()} NextDigital · Honduras</p>
    </footer>
  )
}
