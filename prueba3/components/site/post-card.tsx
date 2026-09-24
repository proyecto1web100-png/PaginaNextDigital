import { ArrowUpRight } from "lucide-react"
import { Tag } from "@/components/ui/tag"
import { formatDate, type Post } from "@/lib/blog"

export function PostCard({ post, href }: { post: Post; href: string }) {
  return (
    <a
      href={href}
      className="group flex h-full flex-col rounded-3xl border border-border bg-card p-6 transition-[border-color,box-shadow] duration-200 hover:border-foreground hover:shadow-[0_24px_50px_-30px_rgba(18,18,18,0.35)] md:p-7"
    >
      <div className="flex items-center gap-2">
        <Tag>{post.tag}</Tag>
        <span className="text-xs text-muted-foreground">{post.minutes} min de lectura</span>
      </div>
      <h3 className="mt-4 text-2xl font-bold leading-tight">{post.title}</h3>
      <p className="mt-3 flex-1 text-[15.5px] leading-relaxed text-ink-2">{post.description}</p>
      <span className="mt-5 flex items-center justify-between text-sm">
        <time dateTime={post.date} className="text-muted-foreground">{formatDate(post.date)}</time>
        <span className="inline-flex items-center gap-1 font-semibold group-hover:text-brand">
          Leer <ArrowUpRight className="size-4" aria-hidden />
        </span>
      </span>
    </a>
  )
}
