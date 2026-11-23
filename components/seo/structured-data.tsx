import { organizationId, serializeStructuredData, serviceAreas, serviceStructuredData, siteUrl, type ServiceSlug } from '@/lib/seo'

export function StructuredData({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeStructuredData(data) }} />
}

export function OrganizationData() {
  return <StructuredData data={{
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': organizationId, name: 'Koryx', url: siteUrl, email: 'support@koryx.ca', logo: `${siteUrl}/koryx-logo.png`, areaServed: serviceAreas },
      { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: siteUrl, name: 'Koryx', publisher: { '@id': organizationId }, inLanguage: 'en' },
    ],
  }} />
}

export function ServiceData({ slug }: { slug: ServiceSlug }) {
  return <StructuredData data={serviceStructuredData(slug)} />
}
