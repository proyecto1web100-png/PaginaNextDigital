# NextDigital

Landing page de NextDigital, estudio de diseño web en Honduras. El repositorio tiene tres versiones de prueba:

| Carpeta | Qué es | Cómo verla |
|---|---|---|
| `prueba1/` | Rediseño estático (HTML + CSS + JS, sin build), tema claro. | `cd prueba1 && python3 -m http.server 8000` |
| `prueba2/` | Next.js + shadcn/ui + framer-motion, tema oscuro. Hero con carrusel cilíndrico, notch navbar, glass dock, bento de resultados y formulario de acceso. | `cd prueba2 && npm install && npm run dev` |
| `prueba3/` | Diseño de prueba1 (papel, tinta, azul y naranja) con las funciones de prueba2. Carrusel a lo ancho de la pantalla con capturas horizontales. | `cd prueba3 && npm install && npm run dev` |

`prueba2` y `prueba3` se exportan como sitio estático (`npm run build` genera `out/`). Para publicarlo en una sub-ruta de GitHub Pages, construir con `NEXT_PUBLIC_BASE_PATH=/PaginaNextDigital/prueba3 npm run build`.
