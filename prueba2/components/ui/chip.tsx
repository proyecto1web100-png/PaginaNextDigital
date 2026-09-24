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
        "inline-flex h-8 items-center gap-1 rounded-full border border-brand/30 bg-brand/10 pl-3 pr-1 text-sm font-medium text-blue-200",
        className
      )}
      {...props}
    >
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label={removeLabel}
        className="press grid size-6 place-items-center rounded-full text-blue-200/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-brand"
      >
        <X className="size-3.5" aria-hidden />
      </button>
    </span>
  )
}

export { Chip }
