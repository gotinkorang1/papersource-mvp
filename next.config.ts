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
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
        ],
      },
    ];
  },
};

export default nextConfig;
