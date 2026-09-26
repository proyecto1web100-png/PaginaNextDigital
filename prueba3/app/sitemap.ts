import type { MetadataRoute } from "next"
import { POSTS } from "@/lib/blog"
import { SITE_URL } from "@/lib/site"

export const dynamic = "force-static"

export default function sitemap(): MetadataRoute.Sitemap {
  const latest = POSTS.map((p) => p.date).sort().at(-1)
  return [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/cotizar/`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/blog/`, lastModified: latest, changeFrequency: "weekly", priority: 0.7 },
    ...POSTS.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}/`, lastModified: p.date, changeFrequency: "monthly" as const, priority: 0.6 })),
    { url: `${SITE_URL}/privacidad/`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/cookies/`, changeFrequency: "yearly", priority: 0.2 },
  ]
}
