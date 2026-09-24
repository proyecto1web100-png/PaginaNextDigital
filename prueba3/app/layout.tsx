import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/bricolage-grotesque";
import { MotionProvider } from "@/components/site/motion-provider";
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
      </body>
    </html>
  );
}
