import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NODE_ENV === 'production' ? '.next' : '.next-dev',
  turbopack: {
    root: process.cwd(),
  },
  serverExternalPackages: ['firebase-admin'],
  experimental: {
    scrollRestoration: true,
  },
  devIndicators: {
    appIsrStatus: false,
  },
  allowedDevOrigins: ['localhost', '127.0.0.1']
};

export default nextConfig;
