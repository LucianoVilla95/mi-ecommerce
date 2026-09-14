import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import QueryProvider from "@/providers/query-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "AVORA ecommerce",
    template: "%s | Mi E-commerce"
  },
  description: "Descubrí nuestro catálogo completo de productos con los mejores precios y envíos rápidos.",
  keywords: ["e-commerce", "tienda online", "compras", "productos"],
  authors: [{ name: "AVORA" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} data-scroll-behavior="smooth">
      <body className={`${geistSans.className} min-h-screen bg-white`}>
        <QueryProvider>
          <Header />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
