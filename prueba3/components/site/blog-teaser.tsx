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
        <p className="mt-6 text-sm text-muted-foreground md:hidden">Desliza para ver más consejos →</p>
        <div className="mt-3 -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:overflow-visible md:px-0 md:pb-0 md:snap-none md:mt-10 md:grid md:grid-cols-3 md:gap-4">
          {POSTS.slice(0, 3).map((p) => (
            <div key={p.slug} className="w-[84%] shrink-0 snap-center md:w-auto"><PostCard post={p} href={page(0, `blog/${p.slug}`)} /></div>
          ))}
        </div>
      </div>
    </section>
  )
}
