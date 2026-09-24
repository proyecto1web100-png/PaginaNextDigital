import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/** Tag: non-interactive category metadata. Squared corners set it apart from status pills. */
function Tag({ className, ...props }: React.ComponentProps<typeof Badge>) {
  return (
    <Badge
      variant="outline"
      data-slot="tag"
      className={cn(
        "rounded-md border-white/10 bg-white/[0.03] px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-foreground/60",
        className
      )}
      {...props}
    />
  )
}

export { Tag }
