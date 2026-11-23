// Run against a running preview or production: SEO_BASE_URL=https://koryx.ca node tests/seo-http.cjs
const assert = require('node:assert/strict')
const base = process.env.SEO_BASE_URL || 'http://127.0.0.1:3107'
const decode = text => text.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'")
function tags(html, tag) {
  return [...html.matchAll(new RegExp(`<${tag}\\b[^>]*>`, 'g'))].map(([text]) => Object.fromEntries([...text.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, decode(value)])))
}
;(async () => {
  const sitemap = await fetch(`${base}/sitemap.xml`)
  assert.equal(sitemap.status, 200)
  assert(sitemap.headers.get('content-type').includes('xml'))
  const urls = [...(await sitemap.text()).matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1])
  assert.equal(urls.length, 19)
  const titles = new Set()
  for (const url of urls) {
    const path = new URL(url).pathname
    const res = await fetch(`${base}${path}`, { headers: { 'user-agent': 'Googlebot' } })
    assert.equal(res.status, 200, path)
    assert(!res.headers.get('x-robots-tag')?.includes('noindex'), path)
    const html = await res.text(), meta = tags(html, 'meta'), links = tags(html, 'link')
    assert.equal(links.filter(l => l.rel === 'canonical').length, 1, path)
    assert.equal(new URL(links.find(l => l.rel === 'canonical').href).href, url, path)
    assert(meta.find(m => m.name === 'description')?.content, path)
    assert(!meta.some(m => m.name === 'robots' && m.content.includes('noindex')), path)
    assert.equal(new URL(meta.find(m => m.property === 'og:url')?.content).href, url, path)
    const socialImage = new URL(meta.find(m => m.property === 'og:image')?.content)
    assert.equal(socialImage.pathname, '/opengraph-image', path)
    if (new URL(base).hostname === 'koryx.ca') assert.equal(socialImage.origin, 'https://koryx.ca', path)
    const title = html.match(/<title>(.*?)<\/title>/)?.[1]
    assert(title && !titles.has(title), `Missing or duplicate title: ${path}`); titles.add(title)
    assert.equal((html.match(/<h1\b/g) || []).length, 1, `One page heading: ${path}`)
    const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(m => JSON.parse(m[1]))
    assert(schemas.some(s => s['@graph']?.some(e => e['@type'] === 'Organization')), path)
    if (path.startsWith('/services/')) assert(schemas.some(s => s['@type'] === 'Service' && s.url === url), path)
    console.log(`200 + canonical + indexable HTML: ${path}`)
  }
  const robots = await fetch(`${base}/robots.txt`)
  assert.equal(robots.status, 200)
  assert((await robots.text()).includes('Sitemap: https://koryx.ca/sitemap.xml'))
  for (const path of ['/login', '/register', '/documents/not-a-document', '/invoice-SEO-NOT-REAL', '/receipt-SEO-NOT-REAL', '/api/not-a-route']) {
    const res = await fetch(`${base}${path}`, { redirect: 'manual' })
    assert(res.headers.get('x-robots-tag')?.includes('noindex'), `Private HTTP noindex: ${path}`)
  }
  for (const path of ['/services/not-a-service', '/toString', '/not-a-page']) {
    const res = await fetch(`${base}${path}`)
    assert.equal(res.status, 404, path)
  }
  const alias = await fetch(`${base}/price`, { redirect: 'manual' })
  assert.equal(alias.status, 308)
  assert(alias.headers.get('location')?.endsWith('/pricing'))
  const image = await fetch(`${base}/opengraph-image`)
  assert.equal(image.status, 200)
  assert(image.headers.get('content-type').includes('image/png'))
  assert((await image.arrayBuffer()).byteLength > 10000)
  console.log('HTTP SEO checks passed: 19 public pages, private noindex, real 404s, pricing redirect, robots and social card.')
})().catch(error => { console.error(error); process.exitCode = 1 })
