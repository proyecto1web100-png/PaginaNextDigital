# NextDigital

Landing page de NextDigital, estudio de diseño web en Honduras. El repositorio tiene dos versiones de prueba:

| Carpeta | Qué es | Cómo verla |
|---|---|---|
| `prueba1/` | Rediseño estático (HTML + CSS + JS, sin build), tema claro. | `cd prueba1 && python3 -m http.server 8000` |
| `prueba2/` | Next.js + shadcn/ui + framer-motion, tema oscuro. Hero con carrusel cilíndrico, notch navbar, glass dock, bento de resultados y formulario de acceso. | `cd prueba2 && npm install && npm run dev` |

`prueba2` se exporta como sitio estático (`npm run build` genera `prueba2/out/`). Para publicarlo en una sub-ruta de GitHub Pages, construir con `NEXT_PUBLIC_BASE_PATH=/PaginaNextDigital/prueba2 npm run build`.
