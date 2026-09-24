// Shared motion tokens (spring physics, never from scale 0).
export const spring = { type: "spring", stiffness: 380, damping: 30, mass: 0.8 } as const
export const gentle = { type: "spring", stiffness: 280, damping: 28 } as const
export const snappy = { type: "spring", stiffness: 500, damping: 35 } as const

/** Fade-up on scroll into view, used once per section group (no stagger spam). */
export const inView = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: gentle,
} as const
