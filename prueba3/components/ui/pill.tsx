import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type Tone = "success" | "brand" | "neutral"

const tones: Record<Tone, { pill: string; dot: string }> = {
  success: { pill: "border-transparent bg-[#e4f6ea] text-[#10653a]", dot: "bg-[#10653a]" },
  brand: { pill: "border-transparent bg-[#e6e9ff] text-[#1a30cc]", dot: "bg-brand" },
  neutral: { pill: "border-border bg-card text-ink-2", dot: "bg-muted-foreground" },
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
      className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone].pill, className)}
      {...props}
    >
      <span aria-hidden className={cn("size-1.5 rounded-full", tones[tone].dot)} />
      {children}
    </Badge>
  )
}

export { Pill }
