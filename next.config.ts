import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Empty turbopack config to silence warning, build with webpack for WalletConnect compatibility
  turbopack: {},
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  // Rewrite .well-known/farcaster.json to dynamic API route
  async rewrites() {
    return [
      {
        source: "/.well-known/farcaster.json",
        destination: "/api/farcaster-manifest",
      },
    ];
  },
};

export default nextConfig;
