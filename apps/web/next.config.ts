import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@mogoj/shared"],
  // The floating "N" dev badge sat on top of the sidebar footer
  devIndicators: false,
};

export default nextConfig;
