import type { NextConfig } from "next";

// Static export so the site can be hosted on GitHub Pages.
// Set NEXT_PUBLIC_BASE_PATH (e.g. "/PaginaNextDigital/prueba2") when the
// site is served from a sub-path.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
};

export default nextConfig;
