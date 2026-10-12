import { Navbar } from '@/components/vercel-home/navbar'
import { Hero } from '@/components/vercel-home/hero'
import { Features, WorkShowcase, QualitySection, ProcessSection, FAQSection } from '@/components/vercel-home/features'
import { BudgetPricing } from '@/components/workspace/budget-pricing'
import { Footer } from '@/components/vercel-home/footer'

export default function HomePage() {
  return <div className="bg-black text-white min-h-screen overflow-x-hidden"><Navbar/><main><Hero/><WorkShowcase/><Features/><BudgetPricing compact/><QualitySection/><ProcessSection/><FAQSection/></main><Footer/></div>
}
