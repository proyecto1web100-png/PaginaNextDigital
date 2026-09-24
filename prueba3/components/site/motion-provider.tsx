"use client"

import { MotionConfig } from "framer-motion"

/** Honors the OS "reduce motion" setting: transforms are skipped, opacity still resolves to visible. */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
