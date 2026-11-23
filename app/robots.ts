import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  // Account and document routes send noindex headers. Allow crawling those
  // URLs so engines can actually read the directive; authentication still applies.
  return { rules: { userAgent: '*', allow: '/', disallow: '/api/' }, sitemap: `${siteUrl}/sitemap.xml` }
}
