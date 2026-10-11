const testimonials = [
  {
    "quote": "Koryx builds business websites, landing pages, dashboards, booking systems, client portals, and custom SaaS applications.",
    "author": "What can I order?",
    "role": "Websites, SaaS & software",
    "avatar": "/koryx-logo.png"
  },
  {
    "quote": "Tell us about your business, goals, features, and budget. We agree on scope, pricing, and milestones before development begins.",
    "author": "How do we start?",
    "role": "A clear project brief",
    "avatar": "/koryx-logo.png"
  },
  {
    "quote": "You receive design and development previews so you can review the work and give feedback before launch.",
    "author": "Will I see progress?",
    "role": "Working previews",
    "avatar": "/koryx-logo.png"
  },
  {
    "quote": "Your layout, interactions, and functionality are designed around your brand and workflow, using maintainable code.",
    "author": "Is it custom built?",
    "role": "Built for your business",
    "avatar": "/koryx-logo.png"
  },
  {
    "quote": "We can connect APIs, databases, booking tools, and payment providers when they are included in the agreed project scope.",
    "author": "Can you connect my tools?",
    "role": "Integrations & automation",
    "avatar": "/koryx-logo.png"
  },
  {
    "quote": "We help launch the finished project and explain how to use it. Maintenance and ongoing improvements can be agreed separately.",
    "author": "What happens after launch?",
    "role": "Handover & support",
    "avatar": "/koryx-logo.png"
  }
]


export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 border-t border-white/[0.06] relative overflow-hidden">
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-48"
        style={{
          background: 'radial-gradient(ellipse, rgba(255,255,255,0.04) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16">
          <p className="vercel-section-label mb-4">Common questions</p>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight vercel-gradient-text mb-5">
            Before we build<br />your project
          </h2>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {testimonials.map((t, i) => (
            <div key={i} className="vercel-feature-card p-6 break-inside-avoid vercel-animate-fade-in-up" style={{ animationDelay: `${i * 0.07}s` }}>
              <p className="text-[14px] text-white/55 leading-relaxed mb-5">{t.quote}</p>
              <div className="flex items-center gap-3">
                <img src={t.avatar} alt={t.author} className="w-8 h-8 rounded-full object-cover ring-1 ring-white/10" />
                <div>
                  <div className="text-[13px] font-medium text-white">{t.author}</div>
                  <div className="text-[11px] text-white/35">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
