import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://xprofilecards.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/', // Allow everything
        disallow: [
          '/api/',          // Prevent internal API crawling
          '/_next/',        // Prevent Next.js build artifacts
          '/static/',       // Avoid build assets
          '/favicon.ico',
          '/404',           // Skip 404 page
          '/500',           // Skip error page
        ],
        crawlDelay: 1, // small delay helps Google crawl smarter, not slower
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 1,
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/', // Let Google index images (important for your card previews)
      },
      {
        userAgent: 'Googlebot-Mobile',
        allow: '/', // Enable mobile-first indexing
      },
      {
        userAgent: 'Bingbot',
        allow: '/', // Bing SEO helps visibility too
      },
      {
        userAgent: 'DuckDuckBot',
        allow: '/',
      },
      {
        userAgent: 'Yandex',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}