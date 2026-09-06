import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/pwa/pwa-register";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: {
    default: "PaperSource — Workplace supplies, simply sourced",
    template: "%s · PaperSource",
  },
  description:
    "Office stationery, paper, printing supplies and workplace essentials — delivered across Accra & Tema. Nationwide supply on request.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en-GH"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${inter.variable} ${manrope.variable} h-full antialiased`}
    >
      <head><link rel="apple-touch-icon" href="/icons/papersource-192.svg" /></head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <script dangerouslySetInnerHTML={{ __html: `(() => { const saved = localStorage.getItem("papersource-theme"); const dark = saved === "dark" || (!saved && matchMedia("(prefers-color-scheme: dark)").matches); document.documentElement.classList.toggle("dark", dark); })()` }} />
        {children}
        <PwaRegister />
        <Analytics />
      </body>
    </html>
  );
}
