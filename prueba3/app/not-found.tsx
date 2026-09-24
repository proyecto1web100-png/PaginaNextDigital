import type { Metadata } from "next"
import { NotFoundView } from "@/components/site/not-found-view"

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false },
}

export default function NotFound() {
  return <NotFoundView />
}
