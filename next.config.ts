import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/scaling-eureka',
  trailingSlash: true,
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      { hostname: 'tilecache.rainviewer.com' },
    ],
  },
};

export default nextConfig;
