export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Prefix a /public asset with the base path (needed for static export on a sub-path). */
export const asset = (path: string) => `${BASE_PATH}${path}`;

export const PHONE = "50492271300";
export const PHONE_DISPLAY = "+504 9227-1300";
export const INSTAGRAM = "https://instagram.com/NextDigitalhn";

export const wa = (text?: string) =>
  `https://wa.me/${PHONE}${text ? `?text=${encodeURIComponent(text)}` : ""}`;

export type Project = {
  slug: string;
  name: string;
  category: string;
  filter: "Belleza" | "Moda" | "Legal";
  url: string;
  host: string;
  card: string;
  shot: string;
  result: string;
  summary: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "kenias-studio",
    name: "Kenias Studio",
    category: "Salón de belleza",
    filter: "Belleza",
    url: "https://keniastudio.netlify.app/",
    host: "keniastudio.netlify.app",
    card: "/portfolio/kenias-studio-card.webp",
    shot: "/portfolio/kenias-studio.webp",
    result: "+40% reservas",
    summary: "Citas online 24/7, catálogo de servicios con precios y galería de trabajos.",
  },
  {
    slug: "gabys-fashion",
    name: "Gabys Fashion",
    category: "Moda · E-commerce",
    filter: "Moda",
    url: "https://gabysfashion.netlify.app/",
    host: "gabysfashion.netlify.app",
    card: "/portfolio/gabys-fashion-card.webp",
    shot: "/portfolio/gabys-fashion.webp",
    result: "Vende 24/7",
    summary: "Catálogo online con pedidos directos por WhatsApp y panel de inventario.",
  },
  {
    slug: "legal-force",
    name: "Legal Force",
    category: "Bufete jurídico",
    filter: "Legal",
    url: "https://legalforcehn.netlify.app/",
    host: "legalforcehn.netlify.app",
    card: "/portfolio/legal-force-card.webp",
    shot: "/portfolio/legal-force.webp",
    result: "Imagen profesional",
    summary: "Web corporativa con áreas de práctica y contacto directo por WhatsApp.",
  },
];
