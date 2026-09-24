import { ChatAssistant } from "./chat"
import { CookieBanner } from "./cookie-banner"
import { SiteFooter } from "./footer"
import { SiteNav } from "./site-nav"

/** Layout for inner pages (blog, legal, 404). `depth` = folders below the home page. */
export function PageShell({ depth, children }: { depth: number; children: React.ReactNode }) {
  return (
    <>
      <SiteNav depth={depth} />
      <main className="mx-auto w-full max-w-[1180px] px-4 pb-16 pt-28 md:px-8 md:pt-32">{children}</main>
      <SiteFooter depth={depth} />
      <CookieBanner depth={depth} />
      <ChatAssistant />
    </>
  )
}

export function PageEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
      <span aria-hidden className="h-[2px] w-7 rounded-full bg-orange" />
      {children}
    </p>
  )
}
