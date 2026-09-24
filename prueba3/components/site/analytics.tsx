"use client"

import { useEffect } from "react"
import { onConsentChange, readConsent } from "@/lib/consent"
import { track } from "@/lib/track"

/** Records one page view (once consent exists) and every tap on a WhatsApp link. */
export function Analytics() {
  useEffect(() => {
    let viewed = false
    const view = () => {
      if (viewed || !readConsent()?.analytics) return
      viewed = true
      track("view")
    }
    view()
    const off = onConsentChange(view)

    const onClick = (e: MouseEvent) => {
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null
      if (a && /(^|\/\/)(wa\.me|api\.whatsapp\.com)\//.test(a.href)) track("whatsapp")
    }
    document.addEventListener("click", onClick, { capture: true })
    return () => {
      off()
      document.removeEventListener("click", onClick, { capture: true })
    }
  }, [])
  return null
}
