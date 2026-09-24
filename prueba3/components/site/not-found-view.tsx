"use client"

import { useSyncExternalStore } from "react"
import { FaWhatsapp } from "react-icons/fa"
import { BASE_PATH, wa } from "@/lib/site"
import { LogoN } from "./logo"

// The 404 can be served at any depth, so the home link is resolved from the real URL:
// under GitHub Pages the site lives in BASE_PATH, on Netlify at the domain root.
const noop = () => () => {}
const homeFromLocation = () =>
  BASE_PATH && window.location.pathname.startsWith(BASE_PATH) ? `${BASE_PATH}/` : "/"

export function NotFoundView() {
  const homeHref = useSyncExternalStore(noop, homeFromLocation, () => "/")
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-16">
      <div className="w-full max-w-xl text-center">
        <a href={homeHref} aria-label="NextDigital, inicio" className="inline-block">
          <LogoN className="text-5xl" />
        </a>
        <p className="mt-10 font-display text-[clamp(6rem,22vw,11rem)] font-extrabold leading-none tracking-[-0.06em]">
          4<span className="text-orange">0</span>4
        </p>
        <h1 className="mt-2 text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-tight">Esta página no existe.</h1>
        <p className="mx-auto mt-4 max-w-[42ch] text-lg text-ink-2">
          Puede que el enlace esté mal escrito o que la página se haya movido.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a href={homeHref} className="press inline-flex h-12 items-center rounded-full bg-foreground px-6 font-semibold text-background hover:bg-brand">
            Volver al inicio
          </a>
          <a
            href={wa("Hola NextDigital! Llegué a una página que no existe en su sitio.")}
            target="_blank"
            rel="noopener noreferrer"
            className="press inline-flex h-12 items-center gap-2 rounded-full border-[1.5px] border-foreground px-6 font-semibold hover:bg-foreground hover:text-background"
          >
            <FaWhatsapp aria-hidden /> Escríbenos
          </a>
        </div>
      </div>
    </main>
  )
}
