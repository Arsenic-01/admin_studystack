import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  /* config options here */
  async rewrites() {
    return [
      {
        // Changed from /ingest/static/...
        source: "/api/event/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        // Changed from /ingest/...
        source: "/api/event/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
