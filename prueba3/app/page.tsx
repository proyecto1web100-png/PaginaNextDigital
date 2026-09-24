import { BlogTeaser } from "@/components/site/blog-teaser"
import { ChatAssistant } from "@/components/site/chat"
import { Contact, SocialDock } from "@/components/site/contact"
import { CookieBanner } from "@/components/site/cookie-banner"
import { FaqSection } from "@/components/site/faq"
import { SiteFooter } from "@/components/site/footer"
import { Hero } from "@/components/site/hero"
import { Plans } from "@/components/site/plans"
import { Portfolio } from "@/components/site/portfolio"
import { QuoteForm } from "@/components/site/quote-form"
import { Results } from "@/components/site/results"
import { SignIn } from "@/components/site/sign-in"
import { SiteNav } from "@/components/site/site-nav"
import { StructuredData } from "@/components/site/structured-data"

export default function Home() {
  return (
    <>
      <StructuredData />
      <SiteNav />
      <main>
        <Hero />
        <Portfolio />
        <Results />
        <Plans />
        <QuoteForm />
        <FaqSection />
        <BlogTeaser />
        <SignIn />
        <Contact />
      </main>
      <SiteFooter />
      <SocialDock />
      <ChatAssistant />
      <CookieBanner />
    </>
  )
}
