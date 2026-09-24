"use client"

import { motion, useReducedMotion } from "framer-motion"
import { CylinderCarousel, type CarouselImage } from "@/components/ui/cylinder-carousel"
import { PROJECTS, asset } from "@/lib/site"
import { gentle } from "./motion"

// Three real projects, repeated so the ring spans the full screen width.
// Only the first set is exposed to assistive tech / tab order.
const ROUNDS = 4
const CARDS: CarouselImage[] = Array.from({ length: ROUNDS }).flatMap((_, round) =>
  PROJECTS.map((p) => ({
    src: asset(p.card),
    alt: `Sitio web de ${p.name}`,
    href: p.url,
    title: p.name,
    subtitle: p.host,
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
    <section id="inicio" aria-labelledby="hero-title" className="relative overflow-hidden pt-24 md:pt-28">
      <h1
        id="hero-title"
        className="relative isolate px-4 text-center text-[clamp(2.8rem,8.4vw,7.2rem)] font-bold leading-[0.92] tracking-[-0.045em]"
      >
        <motion.span className="block text-foreground" {...enter(0)}>
          La página que{" "}
          <span className="relative inline-block">
            necesitas
            <span aria-hidden className="absolute -inset-x-[1%] bottom-[0.08em] -z-10 h-[0.16em] rounded-sm bg-orange" />
          </span>
        </motion.span>
        <motion.span className="block text-foreground/25" {...enter(0.12)}>
          a tu alcance
        </motion.span>
      </h1>

      <motion.div
        className="relative mt-2 md:mt-0"
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
          cardWidth="clamp(250px, 31vw, 460px)"
          cardAspect="16/10"
          perspectiveFactor={2.8}
          edgeFade={6}
          animationDuration={60}
          className="h-[clamp(210px,24vw,360px)]"
          aria-label="Portafolio: haz clic en un proyecto para abrir el sitio"
          role="region"
        />
      </motion.div>
    </section>
  )
}
