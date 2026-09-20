import type { Metadata } from "next";
import type { Viewport } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/pwa/pwa-register";
import { PwaSplash } from "@/components/pwa/pwa-splash";
import { DEFAULT_DESCRIPTION, DEFAULT_SHARE_IMAGE, SEO_KEYWORDS, SITE_NAME, SITE_URL, siteJsonLd } from "@/lib/seo";

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
  keywords: SEO_KEYWORDS,
  applicationName: SITE_NAME,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "business",
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
    icon: [
      { url: "/icon.svg", type: "image/svg+xml", sizes: "512x512" },
      { url: "/icons/papersource-logo.png", type: "image/png", sizes: "512x512" },
    ],
    shortcut: ["/icons/papersource-logo.png"],
    apple: "/icons/papersource-logo.png",
  },
  appleWebApp: {
    capable: true,
    title: "PaperSource",
    statusBarStyle: "black-translucent",
  },
  formatDetection: { telephone: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f6f1" },
    { media: "(prefers-color-scheme: dark)", color: "#102a43" },
  ],
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()) }} />
        <script dangerouslySetInnerHTML={{ __html: `(() => { let saved = null; try { saved = localStorage.getItem("papersource-theme"); } catch { /* Storage may be blocked. */ } const dark = saved === "dark" || (!saved && matchMedia("(prefers-color-scheme: dark)").matches); document.documentElement.classList.toggle("dark", dark); })()` }} />
        {children}
        <PwaSplash />
        <PwaRegister />
        <Analytics />
      </body>
    </html>
  );
}
