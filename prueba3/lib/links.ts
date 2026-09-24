/**
 * Relative links that work on every host (Netlify at the domain root and GitHub Pages
 * under /PaginaNextDigital/). `depth` is how many folders deep the current page is:
 * home = 0, /blog/ = 1, /blog/<slug>/ = 2.
 */
const up = (depth: number) => "../".repeat(depth)

/** Link to a section of the home page, e.g. home(1, "planes") → "../#planes". */
export const home = (depth: number, hash?: string) => {
  if (depth === 0) return hash ? `#${hash}` : "./"
  return `${up(depth)}${hash ? `#${hash}` : ""}`
}

/** Link to another page, e.g. page(0, "blog") → "blog/", page(2, "privacidad") → "../../privacidad/". */
export const page = (depth: number, path: string) => `${up(depth)}${path.replace(/^\/|\/$/g, "")}/`
