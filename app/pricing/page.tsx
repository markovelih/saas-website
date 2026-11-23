import { pageMetadata, publicSearchPages } from '@/lib/seo'
import { Navbar } from '@/components/vercel-home/navbar'
import { Footer } from '@/components/vercel-home/footer'
import { PricingExperience } from '@/components/pricing/pricing-experience'
export const metadata = pageMetadata('/pricing', publicSearchPages['/pricing'])
export default async function PricingPage({ searchParams }: { searchParams: Promise<{ mode?: string | string[] }> }) {
  const { mode } = await searchParams
  const initialMode = mode === 'managed' ? 'managed' : 'buyout'
  return <div className="min-h-screen bg-black text-white"><Navbar/><main><PricingExperience key={initialMode} initialMode={initialMode}/></main><Footer/></div>
}
