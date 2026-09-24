import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/bricolage-grotesque";
import { Analytics } from "@/components/site/analytics";
import { MotionProvider } from "@/components/site/motion-provider";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(`${SITE_URL}/`),
  title: {
    default: "NextDigital — Páginas web profesionales en Honduras",
    template: "%s — NextDigital",
  },
  description:
    "Diseñamos páginas web profesionales para negocios en Honduras: restaurantes, salones, tiendas, clínicas y más. En línea en 48 horas, conectadas a tu WhatsApp. Desde L. 2,500.",
  keywords: [
    "páginas web Honduras",
    "diseño web Honduras",
    "crear página web para negocio",
    "página web con WhatsApp",
    "tienda en línea Honduras",
    "landing page Honduras",
  ],
  applicationName: "NextDigital",
  alternates: { canonical: "/" },
  openGraph: {
    title: "NextDigital — La página que necesitas, a tu alcance",
    description: "Páginas web profesionales para negocios en Honduras. En línea en 48 horas, desde L. 2,500.",
    url: "/",
    locale: "es_HN",
    siteName: "NextDigital",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "NextDigital: La página que necesitas, a tu alcance" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NextDigital — La página que necesitas, a tu alcance",
    description: "Páginas web profesionales para negocios en Honduras. En línea en 48 horas.",
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
  // Google Search Console ownership (property https://nextdigitalhn.netlify.app/).
  verification: { google: "C6DyDNiH0iesbEj_NVzaG-4_IPVN6-Iweup2GcFxf0U" },
};

export const viewport: Viewport = {
  themeColor: "#f5f2ec",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
    >
      <head>
        {/* Without JavaScript (blocked or disabled) the entrance animations never run:
            reveal the server-rendered hidden states so the content is still visible. */}
        <noscript>
          <style>{`[style*="opacity:0"]{opacity:1!important;transform:none!important;filter:none!important}`}</style>
        </noscript>
      </head>
      <body className="min-h-dvh bg-background text-foreground">
        <MotionProvider>{children}</MotionProvider>
        <Analytics />
      </body>
    </html>
  );
}
