import type { Metadata } from "next";
import { Big_Shoulders, Inter } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const display = Big_Shoulders({
  variable: "--font-display",
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
});

const body = Inter({
  variable: "--font-body",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "Zona Scule — Unelte și consumabile industriale",
    template: "%s — Zona Scule",
  },
  description:
    "Catalog de unelte, scule și consumabile industriale: căutare rapidă, filtrare după brand, categorie și subcategorie.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={`${display.variable} ${body.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-white text-ink antialiased">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
