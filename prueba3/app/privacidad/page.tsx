import type { Metadata } from "next"
import { LegalBody, LegalHeader } from "@/components/site/legal"
import { PageShell } from "@/components/site/page-shell"
import { INSTAGRAM, PHONE_DISPLAY, wa } from "@/lib/site"

export const metadata: Metadata = {
  title: "Política de privacidad",
  description: "Qué datos recopila NextDigital, para qué los usa y cómo puedes ejercer tus derechos.",
  alternates: { canonical: "/privacidad/" },
}

export default function PrivacyPage() {
  return (
    <PageShell depth={1}>
      <LegalHeader eyebrow="Legal" title="Política de privacidad" />
      <LegalBody>
        <p>
          En NextDigital (Honduras) respetamos tu privacidad. Esta política explica qué datos recopilamos en este sitio,
          para qué los usamos y qué puedes hacer con ellos.
        </p>

        <h2>1. Quién es responsable</h2>
        <p>
          NextDigital, estudio de diseño web en Honduras. Puedes contactarnos por WhatsApp al{" "}
          <a href={wa("Hola NextDigital! Tengo una consulta sobre mis datos personales.")} target="_blank" rel="noopener noreferrer">{PHONE_DISPLAY}</a>{" "}
          o por <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">Instagram</a>.
        </p>

        <h2>2. Qué datos recopilamos</h2>
        <ul>
          <li><strong>Formulario de cotización:</strong> tu nombre, número de teléfono o WhatsApp, nombre y tipo de negocio, plan de interés y el mensaje que escribas.</li>
          <li><strong>Portal de clientes (inicio de sesión con Google):</strong> tu nombre, correo electrónico y foto de perfil de Google, y el nombre y negocio que indiques en tu solicitud.</li>
          <li><strong>Archivos del proyecto:</strong> el logo, fotos, textos u otros archivos que subas en el portal para hacer tu página.</li>
          <li><strong>Estadísticas de visitas (solo si las aceptas):</strong> la página visitada, el sitio desde el que llegaste, el tipo de dispositivo (celular o computadora) y si tocaste un botón de WhatsApp. No guardamos tu dirección IP ni datos que te identifiquen.</li>
          <li><strong>Conversaciones por WhatsApp:</strong> si nos escribes, WhatsApp procesa esos mensajes según sus propias políticas.</li>
        </ul>
        <p>El asistente de preguntas funciona dentro de tu navegador: lo que escribes ahí no se envía ni se guarda.</p>

        <h2>3. Para qué los usamos</h2>
        <ul>
          <li>Responder tu cotización y preparar una propuesta.</li>
          <li>Darte acceso al portal y mostrarte el avance de tu proyecto.</li>
          <li>Hacer tu página web con los archivos que nos compartes.</li>
          <li>Entender cómo se usa el sitio para mejorarlo (estadísticas agregadas).</li>
        </ul>
        <p>No vendemos ni alquilamos tus datos, y no los usamos para publicidad de terceros.</p>

        <h2>4. Con quién los compartimos</h2>
        <p>Usamos proveedores que almacenan o procesan datos por nuestra cuenta:</p>
        <ul>
          <li><strong>Supabase:</strong> base de datos, inicio de sesión y almacenamiento de archivos.</li>
          <li><strong>Google:</strong> inicio de sesión con tu cuenta de Google.</li>
          <li><strong>Netlify y GitHub Pages:</strong> alojamiento del sitio web.</li>
        </ul>
        <p>Estos proveedores pueden tener servidores fuera de Honduras. Solo compartimos lo necesario para prestar el servicio.</p>

        <h2>5. Cuánto tiempo los guardamos</h2>
        <ul>
          <li>Cotizaciones: hasta 12 meses si no se convierten en un proyecto.</li>
          <li>Datos y archivos de clientes: mientras dure la relación y el tiempo necesario para dar soporte.</li>
          <li>Estadísticas: se conservan de forma agregada y sin datos que te identifiquen.</li>
        </ul>

        <h2>6. Tus derechos</h2>
        <p>
          Puedes pedirnos en cualquier momento ver, corregir o eliminar tus datos, o retirar tu consentimiento a las
          estadísticas. Escríbenos por WhatsApp y lo atendemos. Las estadísticas también se pueden desactivar desde
          “Preferencias de cookies” al pie de cada página.
        </p>

        <h2>7. Seguridad</h2>
        <p>
          El acceso al portal requiere tu cuenta de Google y cada cliente solo puede ver sus propios proyectos y archivos.
          Aun así, ningún sistema en internet es 100% seguro; si detectamos un problema que afecte tus datos, te lo
          comunicaremos.
        </p>

        <h2>8. Menores de edad</h2>
        <p>Nuestros servicios están dirigidos a negocios y personas mayores de 18 años.</p>

        <h2>9. Cambios a esta política</h2>
        <p>Si cambiamos esta política, actualizaremos la fecha de arriba. Los cambios importantes se avisarán en el sitio.</p>
      </LegalBody>
    </PageShell>
  )
}
