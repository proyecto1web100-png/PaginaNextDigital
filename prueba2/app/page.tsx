import { Contact, SocialDock } from "@/components/site/contact"
import { Hero } from "@/components/site/hero"
import { Portfolio } from "@/components/site/portfolio"
import { Results } from "@/components/site/results"
import { SignIn } from "@/components/site/sign-in"
import { SiteNav } from "@/components/site/site-nav"

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <Portfolio />
        <Results />
        <SignIn />
        <Contact />
      </main>
      <SocialDock />
    </>
  )
}
