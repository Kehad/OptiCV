import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb"
    }
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["playwright"],
  typedRoutes: true
};

export default nextConfig;

