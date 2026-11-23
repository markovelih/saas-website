const assert = require('node:assert/strict')
const fs = require('node:fs')
const load = require('./helpers/load-typescript.cjs')()
const seo = load('lib/seo.ts')
const sitemap = load('app/sitemap.ts').default()
const robots = load('app/robots.ts').default()
const catalog = load('components/services/catalog.ts').serviceCatalog

assert.deepEqual(Object.keys(seo.serviceSearch).sort(), catalog.map(s => s.slug).sort(), 'Every real service has metadata and a sitemap URL')
assert.equal(new Set(sitemap.map(p => p.url)).size, 19)
assert(sitemap.every(p => p.url.startsWith('https://koryx.ca/') && !p.lastModified), 'Only production URLs; no fabricated modification dates')
assert(!sitemap.some(p => /^\/(?:dashboard|admin|login|register|pay|documents|invoice-|receipt-|price$|api)(?:[/-]|$)/.test(new URL(p.url).pathname)))
assert.equal(robots.sitemap, 'https://koryx.ca/sitemap.xml')
assert.equal(robots.rules.allow, '/')
const titles = new Set(), descriptions = new Set()
for (const path of seo.publicPaths) {
  const slug = path.replace('/services/', '')
  const meta = seo.isServiceSlug(slug) ? seo.serviceMetadata(slug) : seo.pageMetadata(path, seo.publicSearchPages[path])
  assert(meta.title && meta.description)
  assert(!titles.has(meta.title), `Duplicate title: ${path}`); titles.add(meta.title)
  assert(!descriptions.has(meta.description), `Duplicate description: ${path}`); descriptions.add(meta.description)
  assert.equal(meta.alternates.canonical, new URL(path, seo.siteUrl).href)
  assert.equal(meta.openGraph.url, meta.alternates.canonical)
  assert.equal(meta.twitter.description, meta.description)
}
assert(!seo.isServiceSlug('toString')); assert(!seo.isServiceSlug('missing'))
const hostile = '</script><script>alert(1)</script>'
assert(!seo.serializeStructuredData({ name: hostile }).includes('<'))
assert.equal(JSON.parse(seo.serializeStructuredData({ name: hostile })).name, hostile)
for (const slug of Object.keys(seo.serviceSearch)) {
  const schema = seo.serviceStructuredData(slug)
  assert.equal(schema['@type'], 'Service')
  assert.equal(schema.provider['@id'], seo.organizationId)
  assert.deepEqual(schema.areaServed.map(c => c.name), ['Canada', 'United States'])
  assert(!schema.aggregateRating && !schema.address, 'Do not invent reviews or physical offices')
  const route = fs.existsSync(`app/services/${slug}/page.tsx`) ? `app/services/${slug}/page.tsx` : 'app/services/[slug]/page.tsx'
  assert(fs.readFileSync(route, 'utf8').includes('ServiceData'))
}
;(async () => {
  const config = (await import('../next.config.mjs')).default
  const headers = await config.headers()
  for (const source of ['/dashboard/:path*', '/admin/:path*', '/api/:path*', '/pay/:path*', '/documents/:path*', '/invoice-:number', '/receipt-:number', '/login', '/register']) {
    assert(headers.find(rule => rule.source === source)?.headers.some(h => h.key === 'X-Robots-Tag' && h.value.includes('noindex')), `Private route noindex missing: ${source}`)
  }
  console.log('SEO: 19 unique public URLs, complete service coverage, canonical/social metadata, safe structured data and private-route noindex passed.')
})().catch(error => { console.error(error); process.exitCode = 1 })
