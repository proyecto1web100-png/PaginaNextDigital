import { POSTS } from "@/lib/blog"
import { page } from "@/lib/links"
import { PostCard } from "./post-card"
import { SectionHead } from "./section-head"

export function BlogTeaser() {
  return (
    <section id="consejos" aria-labelledby="blog-title" className="bg-paper-2">
      <div className="mx-auto w-full max-w-[1180px] px-4 py-14 md:px-8 md:py-28">
        <SectionHead
          id="blog-title"
          eyebrow="06 · Consejos"
          title="Ideas para vender más en línea."
          lead={
            <>
              Guías cortas para negocios que están empezando en digital.{" "}
              <a href={page(0, "blog")} className="font-semibold text-foreground underline decoration-orange decoration-2 underline-offset-4">
                Ver todo el blog
              </a>
            </>
          }
        />
        <div className="mt-8 grid gap-4 max-md:gap-0 max-md:border-t max-md:border-border md:mt-10 md:grid-cols-3">
          {POSTS.slice(0, 3).map((p) => (
            <div key={p.slug}>
              <a href={page(0, `blog/${p.slug}`)} className="flex items-center justify-between gap-4 border-b border-border py-4 md:hidden">
                <span className="text-[17px] font-semibold leading-snug">{p.title}</span>
                <span aria-hidden className="text-lg">→</span>
              </a>
              <div className="hidden h-full md:block"><PostCard post={p} href={page(0, `blog/${p.slug}`)} /></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
