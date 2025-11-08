import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: 'https', hostname: 'pbs.twimg.com', pathname: '/profile_images/**' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
      { protocol: 'https', hostname: 'wsrv.nl', pathname: '/**' },
      // { protocol: 'https', hostname: 'xprofilecards.com', pathname: '/**' },
    ],
  },

  // 🔧 allow LAN / mobile testing without warnings
  experimental: {
    allowedDevOrigins: ['192.168.0.0/16', '127.0.0.1', 'localhost'],
  },

  // keep compression ON in prod, OFF in dev for cleaner canvas text rendering
  compress: process.env.NODE_ENV === 'production',

  typescript: { ignoreBuildErrors: true },

  webpack(config) {
    config.resolve.fallback = {
      ...(config.resolve.fallback ?? {}),
      fs: false,
      path: false,
      crypto: false,
    };
    // help ESM resolution for modern-screenshot
    config.module.rules.push({
      test: /modern-screenshot/,
      resolve: { fullySpecified: false },
    });
    return config;
  },
};

export default nextConfig;
