import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Lightbulb } from "lucide-react"
import { FaWhatsapp } from "react-icons/fa"
import { Tag } from "@/components/ui/tag"
import { PageShell } from "@/components/site/page-shell"
import { POSTS, formatDate, getPost } from "@/lib/blog"
import { home } from "@/lib/links"
import { SITE_URL, wa } from "@/lib/site"

export const dynamicParams = false

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug)
  if (!post) return {}
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: { type: "article", title: post.title, description: post.description, publishedTime: post.date },
  }
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug)
  if (!post) notFound()

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    inLanguage: "es-HN",
    author: { "@type": "Organization", name: "NextDigital" },
    publisher: { "@type": "Organization", name: "NextDigital" },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}/`,
  }

  return (
    <PageShell depth={2}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <article className="mx-auto max-w-[68ch]">
        <a href="../" className="text-sm font-semibold text-muted-foreground hover:text-foreground">← Blog</a>
        <div className="mt-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Tag>{post.tag}</Tag>
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          <span>· {post.minutes} min de lectura</span>
        </div>
        <h1 className="mt-4 text-[clamp(2.2rem,5vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.035em]">{post.title}</h1>
        <p className="mt-5 text-xl leading-relaxed text-ink-2">{post.description}</p>

        <div className="mt-10 grid gap-5 text-[17.5px] leading-[1.75]">
          {post.body.map((b, i) => {
            if (b.type === "h2") return <h2 key={i} className="mt-6 text-[1.7rem] font-bold leading-tight">{b.text}</h2>
            if (b.type === "ul")
              return (
                <ul key={i} className="grid gap-2 pl-5">
                  {b.items.map((it) => <li key={it} className="list-disc marker:text-orange">{it}</li>)}
                </ul>
              )
            if (b.type === "tip")
              return (
                <aside key={i} className="flex gap-3 rounded-2xl bg-paper-2 p-5 text-[16px]">
                  <Lightbulb className="mt-1 size-5 shrink-0 text-orange" aria-hidden />
                  <p>{b.text}</p>
                </aside>
              )
            return <p key={i} className="text-ink-2">{b.text}</p>
          })}
        </div>

        <div className="mt-14 rounded-3xl bg-foreground p-7 text-background md:p-9">
          <p className="font-display text-2xl font-bold leading-tight">¿Listo para tener tu página?</p>
          <p className="mt-2 text-background/70">Te enviamos una propuesta en menos de 24 horas, sin compromiso.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={wa(`Hola NextDigital! Leí "${post.title}" y quiero una cotización.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="press inline-flex h-11 items-center gap-2 rounded-full bg-background px-5 text-sm font-semibold text-foreground"
            >
              <FaWhatsapp aria-hidden /> Cotizar por WhatsApp
            </a>
            <a href={home(2, "planes")} className="press inline-flex h-11 items-center rounded-full border-[1.5px] border-background/40 px-5 text-sm font-semibold hover:border-background">
              Ver planes
            </a>
          </div>
        </div>
      </article>
    </PageShell>
  )
}
