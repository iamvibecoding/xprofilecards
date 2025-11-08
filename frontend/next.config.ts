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
      // add your own domain if theme images come from your CDN
      // { protocol: 'https', hostname: 'xprofilecards.com', pathname: '/**' },
    ],
  },

  // keep compression ON in prod, OFF in dev for cleaner canvas text rendering
  compress: process.env.NODE_ENV === 'production',

  typescript: { ignoreBuildErrors: true },

  webpack(config) {
    config.resolve.fallback = { ...(config.resolve.fallback ?? {}), fs: false, path: false, crypto: false };
    // help ESM resolution for some bundlers
    config.module.rules.push({ test: /modern-screenshot/, resolve: { fullySpecified: false } });
    return config;
  },
};

export default nextConfig;
