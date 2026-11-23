import Link from 'next/link'

export function MarketSection() {
  return <section className="border-t border-white/15 px-6 py-16 sm:px-12 sm:py-20" aria-labelledby="market-heading">
    <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:gap-16">
      <div><p className="mb-5 text-xs uppercase tracking-[0.18em] text-white/50">Canada &amp; United States</p><h2 id="market-heading" className="text-3xl font-medium tracking-tight sm:text-4xl">Your business.<br />Our next project.</h2></div>
      <div className="space-y-5 text-base leading-relaxed text-white/65">
        <p>Custom website design and software development for businesses across Canada and the United States. Work with Koryx remotely, from your first brief and working preview to launch.</p>
        <p>Build a <Link className="text-white underline underline-offset-4" href="/services/business-websites">business website</Link>, open an <Link className="text-white underline underline-offset-4" href="/services/e-commerce">online store</Link> or connect your operations with <Link className="text-white underline underline-offset-4" href="/services/custom-software">custom software</Link>. Choose a one-time project or explore a managed monthly service. Estimates are shown in Canadian dollars; the final scope and price are agreed before work starts.</p>
        <div className="flex flex-wrap gap-x-7 gap-y-3 pt-2"><Link className="text-white underline underline-offset-4" href="/pricing">Explore pricing</Link><Link className="text-white underline underline-offset-4" href="/contact">Discuss your project</Link></div>
      </div>
    </div>
  </section>
}
