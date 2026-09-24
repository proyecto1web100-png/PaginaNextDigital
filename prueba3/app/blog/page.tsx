import type { Metadata } from "next"
import { PageEyebrow, PageShell } from "@/components/site/page-shell"
import { PostCard } from "@/components/site/post-card"
import { POSTS } from "@/lib/blog"

export const metadata: Metadata = {
  title: "Blog: consejos para vender más en línea",
  description: "Guías cortas para negocios en Honduras: páginas web, WhatsApp, catálogo y cómo empezar en digital.",
  alternates: { canonical: "/blog/" },
}

export default function BlogIndex() {
  return (
    <PageShell depth={1}>
      <PageEyebrow>Blog</PageEyebrow>
      <h1 className="mt-4 max-w-[16ch] text-[clamp(2.6rem,6vw,5rem)] font-bold leading-[0.98] tracking-[-0.04em]">
        Consejos para vender más en línea.
      </h1>
      <p className="mt-5 max-w-[56ch] text-lg text-ink-2">Guías cortas y prácticas para negocios que están empezando en digital.</p>
      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {POSTS.map((p) => (
          <PostCard key={p.slug} post={p} href={`${p.slug}/`} />
        ))}
      </div>
    </PageShell>
  )
}
