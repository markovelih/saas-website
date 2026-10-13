import { Navbar } from '@/components/vercel-home/navbar'
import { Footer } from '@/components/vercel-home/footer'
import { PricingExperience } from '@/components/pricing/pricing-experience'
export const metadata={title:'Project pricing & quotes | Koryx',description:'Shape your website or software project with an itemised CAD estimate. Explore scope, features and a clear 50/50 payment plan before requesting your final quote.'}
export default function PricingPage(){return <div className="min-h-screen bg-black text-white"><Navbar/><main><PricingExperience/></main><Footer/></div>}
