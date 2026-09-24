import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "NextDigital — La página que necesitas",
  description:
    "Estudio de diseño web en Honduras. Páginas web profesionales para restaurantes, barberías, tiendas y clínicas, conectadas a tu WhatsApp.",
  openGraph: {
    title: "NextDigital — La página que necesitas, a tu alcance",
    description: "Páginas web profesionales para emprendedores en Honduras.",
    locale: "es_HN",
    siteName: "NextDigital",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`dark ${GeistSans.variable} ${GeistMono.variable} antialiased`}
    >
      <body className="min-h-dvh bg-background text-foreground">{children}</body>
    </html>
  );
}
