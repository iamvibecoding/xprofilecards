import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*', // Applies to all crawlers
      allow: '/',     // Allows crawlers to visit all pages starting from the root
      // disallow: '/private/', // Add any pages you want to block here
    },
    sitemap: 'https://xprofilecards.com/sitemap.xml',
  }
}