import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Tone = "success" | "brand" | "neutral"

const tones: Record<Tone, { pill: string; dot: string }> = {
  success: { pill: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300", dot: "bg-emerald-400" },
  brand: { pill: "border-brand/25 bg-brand/10 text-blue-300", dot: "bg-brand" },
  neutral: { pill: "border-white/10 bg-white/5 text-foreground/70", dot: "bg-white/50" },
}

/** Pill: fully rounded, short status text. Non-interactive; the dot is static by design. */
function Pill({
  className,
  tone = "success",
  children,
  ...props
}: React.ComponentProps<typeof Badge> & { tone?: Tone }) {
  return (
    <Badge
      variant="outline"
      data-slot="pill"
      className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", tones[tone].pill, className)}
      {...props}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", tones[tone].dot)} />
      {children}
    </Badge>
  )
}

export { Pill }
