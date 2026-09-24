"use client"

import { openCookieSettings } from "@/lib/consent"

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="press w-fit rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:bg-brand"
    >
      Preferencias de cookies
    </button>
  )
}
