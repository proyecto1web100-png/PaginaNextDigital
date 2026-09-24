import { PageEyebrow } from "./page-shell"

export const LEGAL_UPDATED = "24 de septiembre de 2026"

export function LegalHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <>
      <PageEyebrow>{eyebrow}</PageEyebrow>
      <h1 className="mt-4 text-[clamp(2.4rem,5.5vw,4.2rem)] font-bold leading-[1] tracking-[-0.04em]">{title}</h1>
      <p className="mt-4 text-sm text-muted-foreground">Última actualización: {LEGAL_UPDATED}</p>
    </>
  )
}

/** Typography for legal text. */
export function LegalBody({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-10 grid max-w-[70ch] gap-4 text-[16.5px] leading-[1.75] text-ink-2 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:leading-tight [&_h2]:text-foreground [&_li]:list-disc [&_li]:marker:text-orange [&_strong]:text-foreground [&_ul]:grid [&_ul]:gap-2 [&_ul]:pl-5 [&_a]:font-semibold [&_a]:text-foreground [&_a]:underline [&_a]:underline-offset-4">
      {children}
    </div>
  )
}
