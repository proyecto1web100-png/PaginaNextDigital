export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "tip"; text: string }

export type Post = {
  slug: string
  title: string
  description: string
  /** ISO date (YYYY-MM-DD). */
  date: string
  minutes: number
  tag: string
  body: Block[]
}

export const POSTS: Post[] = [
  {
    slug: "landing-page-o-sitio-completo",
    title: "¿Landing page o sitio completo? Qué necesita tu negocio",
    description:
      "La diferencia entre una landing page y un sitio con sistemas integrados, y cómo elegir según el tamaño y las metas de tu negocio.",
    date: "2026-09-24",
    minutes: 4,
    tag: "Guía",
    body: [
      {
        type: "p",
        text: "Cuando un negocio decide tener página web, la primera duda casi siempre es la misma: ¿necesito algo sencillo o un sitio con todo? La respuesta depende menos del tamaño del negocio y más de lo que quieres que la página haga por ti.",
      },
      { type: "h2", text: "Qué es una landing page" },
      {
        type: "p",
        text: "Una landing page es una sola página, pensada para una meta: que la persona que llega te contacte. Presenta quién eres, qué ofreces, tus precios o servicios, fotos de tu trabajo y un botón directo a tu WhatsApp. Es rápida de hacer, fácil de mantener y suficiente para la mayoría de negocios que están empezando en digital.",
      },
      { type: "h2", text: "Cuándo conviene un sitio con sistemas" },
      {
        type: "p",
        text: "Si tu negocio repite tareas todos los días, un sitio con sistemas integrados te ahorra tiempo. Algunos ejemplos:",
      },
      {
        type: "ul",
        items: [
          "Un salón o barbería que agenda citas por mensaje: un sistema de citas en línea deja que tus clientes reserven solos, a cualquier hora.",
          "Una tienda que responde precios uno por uno: un catálogo con carrito arma el pedido y te lo envía completo por WhatsApp.",
          "Un negocio que necesita cambiar precios o fotos seguido: un panel de administración te deja hacerlo sin depender de nadie.",
        ],
      },
      { type: "h2", text: "Cómo decidir" },
      {
        type: "p",
        text: "Hazte una pregunta: ¿qué es lo que más tiempo me quita hoy? Si la respuesta es “explicar quién soy y qué ofrezco”, empieza con una landing page. Si es “agendar, cotizar o tomar pedidos”, un sitio con sistemas se paga solo con el tiempo que te devuelve.",
      },
      {
        type: "tip",
        text: "Puedes empezar con una landing page y crecer después. Una buena base permite agregar citas, catálogo o panel sin rehacer todo.",
      },
    ],
  },
  {
    slug: "mas-clientes-por-whatsapp",
    title: "Cómo recibir más clientes por WhatsApp desde tu página web",
    description:
      "Consejos prácticos para que las personas que visitan tu página terminen escribiéndote por WhatsApp, y lleguen con lo que necesitan saber.",
    date: "2026-09-20",
    minutes: 5,
    tag: "Ventas",
    body: [
      {
        type: "p",
        text: "En Honduras, WhatsApp es el canal donde se cierran la mayoría de las ventas de negocios locales. Tu página web no compite con WhatsApp: su trabajo es llevar a la persona correcta hasta tu chat, con la información que necesita para decidir.",
      },
      { type: "h2", text: "1. Un botón de WhatsApp siempre a la vista" },
      {
        type: "p",
        text: "Si la persona tiene que buscar cómo contactarte, la pierdes. Un botón visible en la parte de arriba y otro fijo al hacer scroll reduce ese esfuerzo al mínimo.",
      },
      { type: "h2", text: "2. Mensajes que se escriben solos" },
      {
        type: "p",
        text: "Un enlace de WhatsApp puede llevar un mensaje ya escrito, por ejemplo: “Hola, vi su página y quiero información del plan Intermedio”. Tu cliente solo toca enviar y tú sabes de inmediato qué le interesa.",
      },
      { type: "h2", text: "3. Responde antes de que pregunten" },
      {
        type: "p",
        text: "Precios o rangos, horarios, ubicación, tiempos de entrega y formas de pago. Cada pregunta que respondes en la página es un mensaje menos que contestar y una persona que te escribe más decidida.",
      },
      { type: "h2", text: "4. Muestra trabajo real" },
      {
        type: "p",
        text: "Fotos de tus productos, de tu local o de trabajos terminados generan más confianza que cualquier texto. Si tienes opiniones de clientes, inclúyelas con su nombre.",
      },
      {
        type: "tip",
        text: "Revisa tu página desde el celular: ahí la va a ver la mayoría de tus clientes. Si el botón de WhatsApp no se ve sin hacer scroll, muévelo.",
      },
    ],
  },
  {
    slug: "que-necesitas-para-empezar-tu-pagina",
    title: "Qué necesitas para empezar tu página web: lista rápida",
    description:
      "La lista de lo que conviene tener a mano antes de hacer tu página: logo, fotos, textos, precios y contactos. Así sale más rápido y mejor.",
    date: "2026-09-15",
    minutes: 3,
    tag: "Checklist",
    body: [
      {
        type: "p",
        text: "No necesitas saber de tecnología para tener tu página web. Lo que sí ayuda es reunir algunas cosas antes de empezar: con ellas el diseño queda listo más rápido y se parece más a tu negocio.",
      },
      { type: "h2", text: "Lo esencial" },
      {
        type: "ul",
        items: [
          "Tu logo (si no tienes, podemos usar el nombre con una tipografía cuidada).",
          "Entre 5 y 15 fotos de tus productos, tu local o tu trabajo, tomadas con buena luz.",
          "Una lista de tus servicios o productos con precios o rangos de precio.",
          "Tu número de WhatsApp, redes sociales, dirección y horarios.",
        ],
      },
      { type: "h2", text: "Lo que suma" },
      {
        type: "ul",
        items: [
          "Dos o tres opiniones de clientes con su nombre.",
          "Una frase que explique qué te hace diferente.",
          "Las preguntas que más te hacen por WhatsApp: las respondemos en la página.",
        ],
      },
      {
        type: "tip",
        text: "Si ya eres cliente, puedes subir tu logo y tus fotos directamente en el portal de clientes. Así queda todo en un solo lugar.",
      },
    ],
  },
]

export const getPost = (slug: string) => POSTS.find((p) => p.slug === slug)

export const formatDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString("es-HN", { day: "numeric", month: "long", year: "numeric" })
