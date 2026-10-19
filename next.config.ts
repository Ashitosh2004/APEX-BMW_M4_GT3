import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // hide the floating Next.js DevTools indicator (bottom-left "N" button) in dev
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
