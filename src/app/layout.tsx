import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: { default: "Marketplace Unisabana", template: "%s | Marketplace Unisabana" },
  description: "Compra y vende productos entre estudiantes de la Universidad de La Sabana. El marketplace universitario oficial de Unisabana.",
  keywords: ["marketplace", "unisabana", "universidad de la sabana", "compra", "venta", "estudiantes", "productos universitarios"],
  authors: [{ name: "Universidad de La Sabana" }],
  creator: "Universidad de La Sabana",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "es_CO",
    siteName: "Marketplace Unisabana",
    title: "Marketplace Unisabana",
    description: "Compra y vende productos entre estudiantes de la Universidad de La Sabana.",
    images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Marketplace Unisabana" }],
  },
  twitter: { card: "summary_large_image", title: "Marketplace Unisabana", description: "El marketplace universitario de Unisabana" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: "12px", fontFamily: "Inter, sans-serif" } }} />
            <Navbar />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
