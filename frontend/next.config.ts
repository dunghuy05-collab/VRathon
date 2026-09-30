import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  async rewrites() {
    const upstream = process.env.INTERNAL_API_HOSTPORT
      ? `http://${process.env.INTERNAL_API_HOSTPORT}`
      : "http://localhost:8000";
    return [{ source: "/api/v1/:path*", destination: `${upstream}/api/v1/:path*` }];
  },
};

export default nextConfig;

