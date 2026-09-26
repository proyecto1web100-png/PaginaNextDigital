import { FAQS } from "@/lib/faq"
import { CITIES, INSTAGRAM, PHONE, SITE_URL } from "@/lib/site"

/** Business + FAQ structured data (schema.org) for Google rich results. */
export function StructuredData() {
  const business = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": `${SITE_URL}/#negocio`,
    name: "NextDigital",
    description: "Diseño de páginas web profesionales para negocios en todo Honduras, conectadas a WhatsApp.",
    url: `${SITE_URL}/`,
    image: `${SITE_URL}/og.png`,
    telephone: `+${PHONE}`,
    areaServed: [
      { "@type": "Country", name: "Honduras" },
      ...CITIES.map((name) => ({ "@type": "City", name, containedInPlace: { "@type": "Country", name: "Honduras" } })),
    ],
    address: { "@type": "PostalAddress", addressCountry: "HN" },
    priceRange: "L 2,500 - L 5,000+",
    sameAs: [INSTAGRAM],
    makesOffer: [
      { name: "Plan Básico", price: "2500" },
      { name: "Plan Intermedio", price: "4000" },
      { name: "Plan Avanzado", price: "5000" },
      { name: "Plan Negocios", price: "5000" },
    ].map((o) => ({
      "@type": "Offer",
      name: o.name,
      price: o.price,
      priceCurrency: "HNL",
      itemOffered: { "@type": "Service", name: `Página web — ${o.name}` },
    })),
  }
  const faq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(business) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }} />
    </>
  )
}
