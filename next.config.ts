import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  serverExternalPackages: ["react-email", "resend"],
  // Auth actions contain passwords; confirmation URLs contain one-time tokens.
  logging: {
    serverFunctions: false,
    incomingRequests: { ignore: [/^\/auth\/confirm(?:\?|$)/] },
  },
  experimental: {
    // Inline the small Tailwind-generated stylesheet into the initial HTML.
    // This removes the first-load CSS request waterfall on slow mobile
    // connections; Next still emits cacheable links for client navigations.
    inlineCss: true,
    serverActions: {
      bodySizeLimit: "20mb",
      allowedOrigins: [
        "papersourcegh.com",
        "www.papersourcegh.com",
        "papersource-mvp.vercel.app",
        "localhost:3000",
        "127.0.0.1:3000",
      ],
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Cross-Origin-Resource-Policy", value: "same-site" },
          { key: "Origin-Agent-Cluster", value: "?1" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Content-Security-Policy", value: "object-src 'none'; base-uri 'self'; frame-ancestors 'self'" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
