import { Navbar } from '@/components/vercel-home/navbar'
import { Footer } from '@/components/vercel-home/footer'
import { PricingContent } from '@/components/vercel-home/features'
export const metadata={title:'Project pricing & quotes | Koryx'}
export default function PricingPage(){return <div className="min-h-screen bg-black text-white"><Navbar/><main><PricingContent/></main><Footer/></div>}
