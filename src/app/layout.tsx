import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { DEFAULT_DESCRIPTION, DEFAULT_SHARE_IMAGE, SITE_NAME, SITE_URL } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "PaperSource — Workplace supplies, simply sourced",
    template: "%s · PaperSource",
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_GH",
    siteName: SITE_NAME,
    title: "PaperSource — Workplace supplies, simply sourced",
    description: DEFAULT_DESCRIPTION,
    url: "/",
    images: [{ url: DEFAULT_SHARE_IMAGE, width: 1200, height: 900, alt: "PaperSource workplace supplies" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PaperSource — Workplace supplies, simply sourced",
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_SHARE_IMAGE],
  },
  icons: {
    icon: [{ url: "/icons/papersource-192.svg", type: "image/svg+xml" }],
    apple: "/icons/papersource-192.svg",
  },
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
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <script dangerouslySetInnerHTML={{ __html: `(() => { const saved = localStorage.getItem("papersource-theme"); const dark = saved === "dark" || (!saved && matchMedia("(prefers-color-scheme: dark)").matches); document.documentElement.classList.toggle("dark", dark); })()` }} />
        {children}
        <PwaRegister />
        <Analytics />
      </body>
    </html>
  );
}
