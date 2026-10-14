import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Drive RAW Catalog & Mapper | Nikon .NEF Suite",
  description:
    "Catálogo y Mapeador profesional de archivos RAW (.NEF) en Google Drive con galería Dark Mode y descargas selectivas a disco local de Windows.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-dark-950 text-zinc-100 antialiased selection:bg-nikon-amber selection:text-black">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
