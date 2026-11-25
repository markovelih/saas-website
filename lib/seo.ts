import type { Metadata } from 'next'

export const siteUrl = 'https://koryx.ca'
export const organizationId = `${siteUrl}/#organization`
export const serviceAreas = [
  { '@type': 'Country', name: 'Canada' },
  { '@type': 'Country', name: 'United States' },
]

export const serviceSearch = {
  'business-websites': {
    title: 'Business Website Design & Development | Koryx',
    description: 'Custom business websites for Canada and the US. Responsive design, enquiry forms and a guided launch, with clear scope and pricing before work begins.',
    name: 'Business website design and development',
  },
  'custom-software': {
    title: 'Custom Software & SaaS Development | Koryx',
    description: 'Custom web apps, SaaS products and internal business tools for Canada and the US. Plan your workflows, integrations and launch with Koryx.',
    name: 'Custom software and SaaS development',
  },
  'e-commerce': {
    title: 'E-commerce Website Development | Koryx',
    description: 'Custom online stores for businesses in Canada and the US. Product catalogues, checkout and order workflows, with an agreed scope and itemised estimate.',
    name: 'E-commerce website development',
  },
  'appointment-booking': {
    title: 'Online Booking System Development | Koryx',
    description: 'Online booking websites and appointment workflows for service businesses in Canada and the US. Availability, customer details and useful integrations.',
    name: 'Online booking system development',
  },
  'client-dashboards': {
    title: 'Client Portal & Dashboard Development | Koryx',
    description: 'Custom client portals and business dashboards for Canada and the US. Secure account access, useful reporting and workflows built around your business.',
    name: 'Client portal and dashboard development',
  },
  integrations: {
    title: 'API Integrations & Business Automation | Koryx',
    description: 'Connect payments, email, CRM and business tools with custom API integrations. Koryx helps businesses in Canada and the US reduce repetitive work.',
    name: 'API integrations and business automation',
  },
  'seo-speed': {
    title: 'Technical SEO & Website Speed Services | Koryx',
    description: 'Improve website speed, crawlability and technical SEO with Koryx. Practical reviews and scoped improvements for businesses in Canada and the US.',
    name: 'Technical SEO and website performance',
  },
  security: {
    title: 'Website Security & Access Reviews | Koryx',
    description: 'Review website access, permissions and recovery practices with Koryx. Scoped security improvements for business websites and applications.',
    name: 'Website security and access reviews',
  },
} as const

export type ServiceSlug = keyof typeof serviceSearch
export function isServiceSlug(slug: string): slug is ServiceSlug {
  return Object.hasOwn(serviceSearch, slug)
}

export const publicSearchPages = {
  '/': {
    title: 'Web Design & Custom Software in Canada & the US | Koryx',
    description: 'Koryx builds custom websites, online stores and business software for Canada and the US. Explore project pricing or a managed monthly service.',
  },
  '/services': {
    title: 'Web Design, Software & Automation Services | Koryx',
    description: 'Explore Koryx website design, e-commerce, custom software, booking systems and integrations for businesses across Canada and the United States.',
  },
  '/pricing': {
    title: 'Website & Software Development Pricing in CAD | Koryx',
    description: 'Compare website and software project estimates in Canadian dollars. Choose a one-time project or managed monthly service and build an itemised estimate.',
  },
  '/work': {
    title: 'Website Design Concepts & Software Solutions | Koryx',
    description: 'Explore Koryx design concepts for business websites, online stores and custom software. Find an approach that fits your next project.',
  },
  '/catalog': {
    title: 'Website Examples & Interactive Design Concepts | Koryx',
    description: 'Explore interactive Koryx website concepts for your next project. Try the layouts, motion and details, then find a design direction for your business.',
  },
  '/process': {
    title: 'Our Website & Software Development Process | Koryx',
    description: 'From project brief and written scope to working previews, feedback and launch. See how a website or software project with Koryx works.',
  },
  '/faq': {
    title: 'Website & Software Project Questions | Koryx',
    description: 'Answers about Koryx project scope, estimates, payments, ownership and launch. Learn what to expect before starting your website or software project.',
  },
  '/contact': {
    title: 'Contact Koryx About Your Website or Software Project',
    description: 'Discuss a website, online store or software project with Koryx. Serving businesses in Canada and the US. Email support@koryx.ca or send a project brief.',
  },
  '/privacy': { title: 'Privacy Policy | Koryx', description: 'How Koryx handles account, project and billing information, private files and privacy requests.' },
  '/terms': { title: 'Terms of Service | Koryx', description: 'Koryx service terms covering project scope, payments, ownership, managed services and cancellation.' },
  '/refunds': { title: 'Cancellation & Refund Policy | Koryx', description: 'Koryx cancellation and refund information for custom projects, payments and service renewals.' },
  '/cookies': { title: 'Cookies & Privacy Preferences | Koryx', description: 'Understand necessary storage and optional analytics on Koryx, and manage your cookie preferences.' },
} as const

export function pageMetadata(path: string, page: { title: string; description: string }): Metadata {
  const url = new URL(path, siteUrl).href
  const images = [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: 'Koryx — custom websites, apps and software' }]
  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: url },
    openGraph: { title: page.title, description: page.description, url, images, siteName: 'Koryx', type: 'website', locale: 'en_CA' },
    twitter: { card: 'summary_large_image', title: page.title, description: page.description, images },
  }
}

export function serviceMetadata(slug: ServiceSlug): Metadata {
  return pageMetadata(`/services/${slug}`, serviceSearch[slug])
}

export const publicPaths = [
  ...Object.keys(publicSearchPages),
  ...Object.keys(serviceSearch).map(slug => `/services/${slug}`),
]

export function serviceStructuredData(slug: ServiceSlug) {
  const service = serviceSearch[slug]
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${siteUrl}/services/${slug}#service`,
    url: `${siteUrl}/services/${slug}`,
    name: service.name,
    serviceType: service.name,
    description: service.description,
    provider: { '@id': organizationId },
    areaServed: serviceAreas,
  }
}

export function serializeStructuredData(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
