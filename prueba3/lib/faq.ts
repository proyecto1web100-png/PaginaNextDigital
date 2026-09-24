export type Faq = {
  q: string
  a: string
  /** Words that point the chat assistant to this answer (lowercase, no accents). */
  keywords: string[]
}

export const FAQS: Faq[] = [
  {
    q: "¿Cuánto cuesta mi página web?",
    a: "Tenemos tres planes: Básico L. 2,500, Intermedio L. 3,500 y Avanzado L. 4,250. Pagas 50% al iniciar y 50% al entregar. La mensualidad (hosting) es de L. 250 o L. 300 según el plan de soporte que elijas.",
    keywords: ["precio", "precios", "cuesta", "costo", "cuanto cuesta", "cuanto vale", "cuanto sale", "plan", "planes", "pagar", "pago", "lempiras", "mensualidad", "cobran"],
  },
  {
    q: "¿Cuánto tiempo tarda en estar lista?",
    a: "La mayoría de las páginas quedan en línea en menos de 48 horas desde que apruebas el diseño. Proyectos con tienda en línea o sistemas integrados pueden tomar entre 3 y 5 días.",
    keywords: ["tiempo", "tarda", "cuanto tarda", "demora", "cuando", "dias", "horas", "48", "rapido", "entrega", "lista", "listo"],
  },
  {
    q: "¿Qué es una landing page?",
    a: "Es una página de una sola pantalla pensada para presentar tu negocio y convertir visitas en clientes: quién eres, qué ofreces, tus precios o servicios y un botón directo a tu WhatsApp. Para la mayoría de negocios es suficiente para empezar.",
    keywords: ["landing", "que es", "una pagina", "basico"],
  },
  {
    q: "¿Necesito comprar hosting o dominio?",
    a: "No es obligatorio. La mensualidad incluye el hosting y podemos gestionar tu dominio (por ejemplo tunegocio.com) o trabajar con uno que ya tengas. Te explicamos todo sin tecnicismos.",
    keywords: ["hosting", "dominio", "servidor", ".com", "alojamiento"],
  },
  {
    q: "¿Qué necesito para empezar?",
    a: "Solo escribirnos por WhatsApp con una idea de lo que necesitas. Nosotros te hacemos las preguntas correctas y te pedimos tu logo, fotos y textos cuando los necesitemos. No necesitas saber de tecnología.",
    keywords: ["empezar", "iniciar", "comenzar", "necesito", "requisitos", "que necesito"],
  },
  {
    q: "¿Puedo actualizar el contenido yo mismo?",
    a: "Sí. Te entregamos acceso y te enseñamos a hacer cambios básicos. Si prefieres que lo hagamos nosotros, la mensualidad avanzada incluye mantenimiento y actualizaciones.",
    keywords: ["actualizar", "cambiar", "editar", "modificar", "mantenimiento", "cambios"],
  },
  {
    q: "¿Cómo sigo el avance de mi proyecto?",
    a: "En el portal de clientes: entras con tu cuenta de Google, completas tu solicitud y, cuando la aprobamos, ves la etapa, el porcentaje de avance y el siguiente paso de tu página. También puedes subir ahí tu logo y fotos.",
    keywords: ["avance", "portal", "seguimiento", "estado", "proyecto", "acceso", "login", "cuenta"],
  },
  {
    q: "¿Mi página se verá bien en el celular?",
    a: "Sí. Todas nuestras páginas se diseñan primero para celular y se adaptan a tablet y computadora. También quedan optimizadas para cargar rápido y aparecer en Google.",
    keywords: ["celular", "movil", "telefono", "responsive", "responsivo", "google", "seo"],
  },
]

/** Lowercase and strip accents so "cuánto" matches "cuanto". */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
