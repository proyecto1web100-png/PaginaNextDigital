# NextDigital — prueba 3 (página principal)

Diseño de prueba1 (tema claro) con las funciones de prueba2. Next.js (App Router, static export) + Tailwind v4 +
shadcn/ui + framer-motion.

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # genera out/ (sitio estático)
```

Es la página principal publicada. Para GitHub Pages se construye con
`NEXT_PUBLIC_BASE_PATH=/PaginaNextDigital npm run build` y el contenido de `out/` va a la raíz de la rama `gh-pages`
(la versión anterior de la página quedó en `/anterior/`).

Componentes de terceros (VengeanceUI) en `components/ui/`: `cylinder-carousel` y `notch-navbar` (adaptados),
`glass-dock` y `agent-bento-grid`. Secciones en `components/site/`; datos de proyectos y contacto en `lib/site.ts`.

## Portal de clientes (login con Google)

El acceso usa [Supabase](https://supabase.com) (plan gratuito) con **solo Google**:

1. Un cliente toca "Continuar con Google". La primera vez queda **pendiente** y ve "Acceso en revisión".
2. Tú (administrador) entras a `/portal/` con tu Google y ves sus solicitudes: **Aprobar y vincular** (nombre del
   proyecto, plan y URL de su página) o **Rechazar**.
3. Desde el mismo panel actualizas la etapa, el avance y el siguiente paso; el cliente lo ve en su portal.

Cada cliente solo puede leer sus propios proyectos, y solo después de ser aprobado (Row Level Security).
Sin configurar, el botón muestra "El portal de clientes todavía no está conectado".

### Configuración (una sola vez)

1. Crea un proyecto en Supabase.
2. **SQL Editor** → ejecuta `supabase/schema.sql`.
3. **Google Cloud Console** → APIs y servicios → Credenciales → *Crear ID de cliente OAuth* (aplicación web).
   En "URI de redireccionamiento autorizados" pega la *Callback URL* que muestra Supabase en
   Authentication → Providers → Google. Copia el Client ID y el Client Secret en ese mismo panel de Supabase y activa Google.
4. **Authentication → URL Configuration**:
   - Site URL: `https://nextdigitalhn.netlify.app/`
   - Redirect URLs: `https://nextdigitalhn.netlify.app/**`, `https://proyecto1web100-png.github.io/PaginaNextDigital/**`
     y `http://localhost:3000/**`
5. La URL y la anon key del proyecto ya están en `.env.production` (son públicas; RLS protege los datos).
6. Hazte administrador: entra una vez a `/portal/` con tu Google y ejecuta las dos líneas del final de `schema.sql`
   con tu correo.

## Contenido y marketing

- **Preguntas frecuentes** (`lib/faq.ts`): alimentan la sección de preguntas, el asistente de chat y el marcado FAQ para Google.
- **Blog** (`lib/blog.ts`): cada artículo es un objeto con bloques (`p`, `h2`, `ul`, `tip`). Agregar uno ahí lo publica en `/blog/<slug>/`, en el sitemap y en la sección "Consejos" de la portada.
- **SEO**: metadatos, `sitemap.xml`, `robots.txt`, imagen para compartir (`public/og.png`) y datos estructurados del negocio. La URL canónica sale de `NEXT_PUBLIC_SITE_URL` (por defecto `https://nextdigitalhn.netlify.app`).
- **Cotizaciones, archivos y estadísticas**: migración `supabase/migrations/20260924040000_leads_files_analytics.sql`. Las estadísticas solo se registran si el visitante acepta en el aviso de cookies.

## Dominio propio

1. Netlify → tu sitio → **Domain management → Add a domain** (comprarlo ahí o conectar uno que ya tengas).
2. Cuando responda, cambia `NEXT_PUBLIC_SITE_URL` en `.env.production` al dominio nuevo y vuelve a publicar.
3. Supabase → Authentication → URL Configuration: pon el dominio nuevo como **Site URL** y agrega `https://tudominio/**` en **Redirect URLs**.

## Google Business Profile

Crear la ficha en <https://business.google.com> con el nombre NextDigital, categoría "Diseñador de sitios web", el teléfono y la URL del sitio. Ayuda a aparecer en Google Maps y en búsquedas locales.
