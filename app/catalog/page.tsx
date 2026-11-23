import Link from 'next/link'
import { ArrowRight, LayoutGrid } from 'lucide-react'
import { Navbar } from '@/components/vercel-home/navbar'
import { Footer } from '@/components/vercel-home/footer'
import { pageMetadata } from '@/lib/seo'

export const metadata = {
  ...pageMetadata('/catalog', {
    title: 'Website Catalog | Koryx',
    description: 'A home for Koryx website concepts and design directions. Our collection is in preparation; explore our services or tell us about your project.',
  }),
  // Publish collection entries before offering this preparation page to search.
  robots: { index: false, follow: true },
}

export default function CatalogPage() {
  return <div className="min-h-screen bg-black text-white"><Navbar /><main className="mx-auto max-w-7xl px-6 pb-24 pt-32 sm:px-10 sm:pt-40">
    <nav aria-label="Breadcrumb" className="mb-12 flex gap-3 text-xs text-white/50"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Catalog</span></nav>
    <header className="grid gap-8 border-b border-white/15 pb-14 md:grid-cols-2 md:items-end">
      <div><p className="mb-6 text-xs tracking-[.18em] text-white/50">KORYX / THE COLLECTION</p><h1 className="text-5xl font-medium leading-tight tracking-tight sm:text-7xl">Website<br />catalog.</h1></div>
      <p className="max-w-md text-base leading-relaxed text-white/60">A place to explore the websites we can build, discover a design direction and find a starting point for your business.</p>
    </header>
    <section className="my-12 border border-white/15 px-6 py-16 sm:px-12 sm:py-20" aria-labelledby="collection-status">
      <LayoutGrid className="mb-8 text-white/40" size={30} strokeWidth={1.2} aria-hidden="true" />
      <h2 id="collection-status" className="mb-5 text-2xl font-medium tracking-tight sm:text-3xl">The collection is taking shape.</h2>
      <p className="max-w-xl text-sm leading-7 text-white/60">We’re preparing our website examples for this space. Each entry will give you a closer look at its design and possibilities. In the meantime, explore our services or bring us an idea of your own.</p>
      <div className="mt-9 flex flex-wrap gap-5 text-sm"><Link className="inline-flex items-center gap-3 rounded-full border border-white/20 px-6 py-3" href="/services">Explore services <ArrowRight size={15} /></Link><Link className="inline-flex items-center gap-3 px-2 py-3" href="/dashboard/new-order">Tell us about your idea <ArrowRight size={15} /></Link></div>
    </section>
  </main><Footer /></div>
}
