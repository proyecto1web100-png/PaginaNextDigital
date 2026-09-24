"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import { Chip } from "@/components/ui/chip"
import { Pill } from "@/components/ui/pill"
import { Tag } from "@/components/ui/tag"
import { PROJECTS, asset, type Project } from "@/lib/site"
import { cn } from "@/lib/utils"
import { SectionHead } from "./section-head"
import { inView, spring } from "./motion"

const FILTERS: Project["filter"][] = ["Belleza", "Moda", "Legal"]

export function Portfolio() {
  const [filter, setFilter] = useState<Project["filter"] | null>(null)
  const visible = filter ? PROJECTS.filter((p) => p.filter === filter) : PROJECTS

  return (
    <section id="portafolio" aria-labelledby="portfolio-title" className="mx-auto w-full max-w-[1180px] px-4 pb-20 pt-10 md:px-8 md:pb-28 md:pt-12">
      <SectionHead
        id="portfolio-title"
        eyebrow="01 · Portafolio"
        title={<>Negocios reales,<br />sitios en vivo.</>}
        lead="Cada proyecto resolvió un problema concreto: citas perdidas, ventas que dependían de responder a tiempo o clientes que no encontraban información."
      />

      <motion.div {...inView} className="mt-10 flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Filtrar por rubro" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(filter === f ? null : f)}
              className={cn(
                "press h-10 rounded-full border-[1.5px] px-5 text-sm font-semibold transition-colors",
                filter === f
                  ? "border-foreground bg-foreground text-background"
                  : "border-foreground/80 text-foreground hover:bg-foreground hover:text-background"
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex h-10 items-center pl-2" aria-live="polite">
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
      </motion.div>

      <motion.ul layout className="mt-8 grid gap-6 md:grid-cols-3" transition={spring}>
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((p) => (
            <motion.li
              key={p.slug}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1, transition: spring }}
              exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.12, ease: "easeIn" } }}
            >
              <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card transition-[border-color,box-shadow] duration-200 hover:border-foreground hover:shadow-[0_24px_50px_-30px_rgba(18,18,18,0.35)]">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative block aspect-[16/10] overflow-hidden border-b border-border bg-paper-2 outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-brand"
                  aria-label={`Abrir ${p.name} en una pestaña nueva`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={asset(p.card)}
                    alt=""
                    loading="lazy"
                    className="h-full w-full object-cover object-left-top transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                  />
                  <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-background px-3 py-1.5 text-[13px] font-semibold shadow-md">
                    Visitar sitio <ArrowUpRight className="size-3.5" aria-hidden />
                  </span>
                </a>
                <div className="flex flex-1 flex-col gap-3 p-6">
                  <div className="flex flex-wrap items-center gap-2">
                    <Tag>{p.category}</Tag>
                    <Pill tone="success">En vivo</Pill>
                  </div>
                  <h3 className="text-[1.9rem] font-bold leading-none">{p.name}</h3>
                  <p className="text-[15.5px] leading-relaxed text-ink-2">{p.summary}</p>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pt-3">
                    <span className="whitespace-nowrap font-display text-base font-bold tracking-tight">{p.result}</span>
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 border-b-[1.5px] border-current pb-0.5 text-[13px] font-semibold transition-colors hover:text-brand"
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
