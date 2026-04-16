import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { hostname: 'tilecache.rainviewer.com' },
    ],
  },
};

export default nextConfig;
