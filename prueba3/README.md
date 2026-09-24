This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

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
   - Site URL: `https://proyecto1web100-png.github.io/PaginaNextDigital/prueba3/`
   - Redirect URLs: `https://proyecto1web100-png.github.io/PaginaNextDigital/prueba3/portal/` y `http://localhost:3000/portal/`
5. Copia `.env.example` a `.env.local` con la URL y la anon key (Project Settings → API) y vuelve a construir.
6. Hazte administrador: entra una vez a `/portal/` con tu Google y ejecuta las dos líneas del final de `schema.sql`
   con tu correo.
