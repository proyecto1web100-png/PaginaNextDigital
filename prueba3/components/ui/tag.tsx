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
        "rounded-md border-border bg-transparent px-2 py-0.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

export { Tag }
