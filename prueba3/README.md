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
   - Site URL: `https://proyecto1web100-png.github.io/PaginaNextDigital/`
   - Redirect URLs: `https://proyecto1web100-png.github.io/PaginaNextDigital/portal/`,
     `https://proyecto1web100-png.github.io/PaginaNextDigital/prueba3/portal/` y `http://localhost:3000/portal/`
5. Copia `.env.example` a `.env.local` con la URL y la anon key (Project Settings → API) y vuelve a construir.
6. Hazte administrador: entra una vez a `/portal/` con tu Google y ejecuta las dos líneas del final de `schema.sql`
   con tu correo.
