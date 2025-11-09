import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://xprofilecards.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/', // Allow everything
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}