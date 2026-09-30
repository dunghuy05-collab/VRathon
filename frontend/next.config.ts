import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const upstream = process.env.API_BASE_URL ?? "http://localhost:8000";
    return [{ source: "/api/v1/:path*", destination: `${upstream}/api/v1/:path*` }];
  },
};

export default nextConfig;

