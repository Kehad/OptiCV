import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "8mb"
    }
  },
  typedRoutes: true
};

export default nextConfig;

