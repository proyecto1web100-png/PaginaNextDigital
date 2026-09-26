import type { Metadata } from "next"
import { ChatAssistant } from "@/components/site/chat"
import { CookieBanner } from "@/components/site/cookie-banner"
import { SiteFooter } from "@/components/site/footer"
import { QuoteForm } from "@/components/site/quote-form"
import { SiteNav } from "@/components/site/site-nav"

export const metadata: Metadata = {
  title: "Cotiza tu página web",
  description: "Cuéntanos de tu negocio y te enviamos una propuesta para tu página web en menos de 24 horas, sin compromiso. Atendemos todo Honduras.",
  alternates: { canonical: "/cotizar/" },
}

/** Direct, shareable link to the quote form: /cotizar/ (optionally ?plan=Negocios). */
export default function QuotePage() {
  return (
    <>
      <SiteNav depth={1} />
      <main>
        <QuoteForm standalone depth={1} />
      </main>
      <SiteFooter depth={1} />
      <CookieBanner depth={1} />
      <ChatAssistant />
    </>
  )
}
