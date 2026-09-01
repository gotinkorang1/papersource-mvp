import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
    },
  },
};

export default nextConfig;
