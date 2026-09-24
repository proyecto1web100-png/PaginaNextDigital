"use client"

import { motion, useReducedMotion } from "framer-motion"
import { CylinderCarousel, type CarouselImage } from "@/components/ui/cylinder-carousel"
import { PROJECTS, asset } from "@/lib/site"
import { gentle } from "./motion"

// Three real projects, repeated so the cylinder reads as a full ring.
// Only the first set is exposed to assistive tech / tab order.
const CARDS: CarouselImage[] = [0, 1, 2].flatMap((round) =>
  PROJECTS.map((p) => ({
    src: asset(p.card),
    alt: `Sitio web de ${p.name}`,
    href: p.url,
    title: p.name,
    subtitle: p.category,
    decorative: round > 0,
  }))
)

export function Hero() {
  const reduce = useReducedMotion()
  const enter = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 16, filter: "blur(8px)" },
          animate: { opacity: 1, y: 0, filter: "blur(0px)" },
          transition: { ...gentle, delay },
        }

  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden pt-24 pb-16"
    >
      {/* Soft light from above; static, no animation. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] bg-[radial-gradient(60%_60%_at_50%_0%,rgba(59,130,246,0.14),transparent_70%)]"
      />

      <h1
        id="hero-title"
        className="relative px-4 text-center text-[clamp(2.6rem,8vw,6.5rem)] font-semibold leading-[0.95] tracking-[-0.045em]"
      >
        <motion.span className="block text-foreground" {...enter(0)}>
          La página que necesitas
        </motion.span>
        <motion.span className="mt-2 block text-white/30" {...enter(0.12)}>
          a tu alcance
        </motion.span>
      </h1>

      <motion.div
        className="relative mt-6 w-full md:mt-10"
        {...(reduce
          ? {}
          : {
              initial: { opacity: 0, y: 24 },
              animate: { opacity: 1, y: 0 },
              transition: { ...gentle, delay: 0.28 },
            })}
      >
        <CylinderCarousel
          images={CARDS}
          cardWidth="clamp(150px, 40vw, 210px)"
          animationDuration={40}
          className="min-h-[380px] md:min-h-[480px]"
          aria-label="Portafolio: haz clic en un proyecto para abrir el sitio"
          role="region"
        />
      </motion.div>
    </section>
  )
}
