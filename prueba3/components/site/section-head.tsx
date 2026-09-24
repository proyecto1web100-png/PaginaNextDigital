"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { inView } from "./motion"

/** Prueba 1 section header: numbered eyebrow with a rule, big display title, optional lead. */
export function SectionHead({
  id,
  eyebrow,
  title,
  lead,
  className,
}: {
  id: string
  eyebrow: string
  title: React.ReactNode
  lead?: React.ReactNode
  className?: string
}) {
  return (
    <motion.div {...inView} className={cn("grid gap-6 md:grid-cols-[1.3fr_1fr] md:items-end md:gap-12", className)}>
      <div>
        <p className="flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          <span aria-hidden className="h-[2px] w-7 rounded-full bg-orange" />
          {eyebrow}
        </p>
        <h2 id={id} className="mt-4 text-[clamp(2.3rem,5.4vw,4.4rem)] font-bold leading-[1.02]">
          {title}
        </h2>
      </div>
      {lead && <p className="max-w-[52ch] text-[17px] leading-relaxed text-ink-2 md:text-lg">{lead}</p>}
    </motion.div>
  )
}
