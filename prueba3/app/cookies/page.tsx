import type { Metadata } from "next"
import { CookieSettingsButton } from "@/components/site/cookie-settings-button"
import { LegalBody, LegalHeader } from "@/components/site/legal"
import { PageShell } from "@/components/site/page-shell"

export const metadata: Metadata = {
  title: "Política de cookies",
  description: "Qué cookies y almacenamiento usa NextDigital y cómo cambiar tu elección.",
  alternates: { canonical: "/cookies/" },
}

export default function CookiesPage() {
  return (
    <PageShell depth={1}>
      <LegalHeader eyebrow="Legal" title="Política de cookies" />
      <LegalBody>
        <p>
          Este sitio no usa cookies de publicidad ni de redes sociales. Usamos el almacenamiento de tu navegador
          (localStorage) solo para lo siguiente:
        </p>

        <h2>Necesarias (siempre activas)</h2>
        <ul>
          <li><strong>Sesión del portal de clientes:</strong> mantiene tu inicio de sesión con Google. Solo existe si inicias sesión. Proveedor: Supabase.</li>
          <li><strong>Tu elección de cookies:</strong> recuerda si aceptaste o rechazaste las estadísticas, para no preguntarte en cada visita.</li>
        </ul>

        <h2>Estadísticas (opcionales)</h2>
        <p>
          Si las aceptas, registramos la página visitada, el sitio desde el que llegaste, el tipo de dispositivo y los
          toques en botones de WhatsApp. No guardamos tu IP ni un identificador tuyo, y no seguimos tu actividad en otros
          sitios. Nos sirve para saber qué partes de la página funcionan mejor.
        </p>

        <h2>Servicios externos</h2>
        <p>
          Al tocar un botón de WhatsApp o Instagram sales de este sitio; esos servicios aplican sus propias políticas.
          Al iniciar sesión con Google, Google procesa tus datos según su política de privacidad.
        </p>

        <h2>Cambiar tu elección</h2>
        <p>Puedes cambiar tu elección cuando quieras:</p>
        <CookieSettingsButton />
      </LegalBody>
    </PageShell>
  )
}
