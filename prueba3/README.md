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

## Portal de clientes (login)

El formulario de acceso usa [Supabase](https://supabase.com) (plan gratuito): correo y contraseña, Google, Apple
y recuperación de contraseña. Al iniciar sesión el cliente entra a `/portal/`, donde ve el avance de sus proyectos.
Sin configurar, el formulario muestra "El portal todavía no está conectado".

1. Crea un proyecto en Supabase.
2. En **SQL Editor**, ejecuta `supabase/schema.sql` (tabla `projects` con Row Level Security: cada cliente solo ve lo suyo).
3. En **Authentication → URL Configuration**:
   - Site URL: `https://proyecto1web100-png.github.io/PaginaNextDigital/prueba3/`
   - Redirect URLs: `https://proyecto1web100-png.github.io/PaginaNextDigital/prueba3/portal/` y `http://localhost:3000/portal/`
4. (Opcional) En **Authentication → Providers** activa Google y Apple con sus credenciales.
5. Crea a cada cliente en **Authentication → Users → Add user** y agrega su proyecto en la tabla `projects`
   (hay un ejemplo al final de `schema.sql`). Desactiva "Allow new users to sign up" si solo tú creas cuentas.
6. Copia `.env.example` a `.env.local` con la URL y la anon key (Project Settings → API) y vuelve a construir.
