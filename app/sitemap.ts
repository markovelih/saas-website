import type { MetadataRoute } from 'next'
import { publicPaths, siteUrl } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  return publicPaths.map(path => ({ url: new URL(path, siteUrl).href }))
}
