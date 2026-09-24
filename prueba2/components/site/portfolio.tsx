"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { Pill } from "@/components/ui/pill"
import { Tag } from "@/components/ui/tag"
import { PROJECTS, asset, type Project } from "@/lib/site"
import { cn } from "@/lib/utils"
import { inView, spring } from "./motion"

const FILTERS: Project["filter"][] = ["Belleza", "Moda", "Legal"]

export function Portfolio() {
  const [filter, setFilter] = useState<Project["filter"] | null>(null)
  const visible = filter ? PROJECTS.filter((p) => p.filter === filter) : PROJECTS

  return (
    <section id="portafolio" aria-labelledby="portfolio-title" className="mx-auto w-full max-w-6xl px-4 py-20 md:px-8 md:py-28">
      <motion.div {...inView} className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="text-sm font-medium text-brand">Portafolio</p>
          <h2 id="portfolio-title" className="mt-2 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
            Negocios reales, sitios en vivo.
          </h2>
          <p className="mt-4 text-foreground/60">
            Cada proyecto resolvió un problema concreto: citas perdidas, ventas que dependían de responder a tiempo o
            clientes que no encontraban información.
          </p>
        </div>

        <div className="flex flex-col gap-3 md:items-end">
          <div role="group" aria-label="Filtrar por rubro" className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={filter === f}
                onClick={() => setFilter(filter === f ? null : f)}
                className={cn(
                  "press h-9 rounded-full border px-4 text-sm font-medium transition-colors",
                  filter === f
                    ? "border-white bg-white text-black"
                    : "border-white/10 text-foreground/70 hover:border-white/25 hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex h-8 items-center" aria-live="polite">
            <AnimatePresence mode="popLayout">
              {filter && (
                <motion.span
                  key={filter}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1, transition: spring }}
                  exit={{ opacity: 0, transition: { duration: 0.12, ease: "easeIn" } }}
                >
                  <Chip onRemove={() => setFilter(null)} removeLabel={`Quitar filtro ${filter}`}>
                    Filtro: {filter}
                  </Chip>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <motion.ul layout className="mt-12 grid gap-4 md:grid-cols-3" transition={spring}>
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((p) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1, transition: spring }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12, ease: "easeIn" } }}
            >
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-white/[0.08] bg-card shadow-[0_4px_24px_-1px_rgba(0,0,0,0.2)] transition-colors hover:border-white/20">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-[16/10] overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                  aria-label={`Abrir ${p.name} en una pestaña nueva`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(p.shot)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover object-left-top transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                  />
                </a>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag>{p.category}</Tag>
                    <Pill tone="success">En vivo</Pill>
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight">{p.name}</h3>
                  <p className="text-sm leading-relaxed text-foreground/60">{p.summary}</p>
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="text-sm font-medium text-foreground/90">{p.result}</span>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="press inline-flex items-center gap-1 rounded-full text-sm font-medium text-blue-300 hover:text-blue-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                      {p.host}
                      <ArrowUpRight className="size-4" aria-hidden />
                    </a>
                  </div>
                </div>
              </article>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </section>
  )
}
