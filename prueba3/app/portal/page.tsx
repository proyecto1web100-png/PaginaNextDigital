import type { Metadata } from "next"
import { Portal } from "@/components/site/portal"

export const metadata: Metadata = {
  title: "Portal de clientes — NextDigital",
  robots: { index: false, follow: false },
}

export default function PortalPage() {
  return <Portal />
}
