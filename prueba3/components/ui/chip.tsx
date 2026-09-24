"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Chip: an interactive, dismissible token (e.g. the active filter).
 * Not a Badge: it contains a real button. The icon-only remove button gets an aria-label.
 */
function Chip({
  className,
  children,
  onRemove,
  removeLabel,
  ...props
}: React.ComponentProps<"span"> & { onRemove: () => void; removeLabel: string }) {
  return (
    <span
      data-slot="chip"
      className={cn(
        "inline-flex h-8 items-center gap-1 rounded-full bg-brand pl-3 pr-1 text-sm font-medium text-white",
        className
      )}
      {...props}
    >
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="press grid size-6 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </span>
  )
}

export { Chip }
