import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mogoj/shared"],
  // The floating "N" dev badge sat on top of the sidebar footer
  devIndicators: false,
  // Proxy the API through the web origin so auth cookies stay first-party.
  async rewrites() {
    const origin = process.env.API_ORIGIN;
    return origin ? [{ source: "/api/v1/:path*", destination: `${origin}/api/v1/:path*` }] : [];
  },
};

export default nextConfig;
