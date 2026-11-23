import { pageMetadata, publicSearchPages } from '@/lib/seo'
import {Suspense} from 'react'
import { Navbar } from '@/components/vercel-home/navbar'
import { Footer } from '@/components/vercel-home/footer'
import { PricingExperience } from '@/components/pricing/pricing-experience'
export const metadata = pageMetadata('/pricing', publicSearchPages['/pricing'])
export default function PricingPage(){return <div className="min-h-screen bg-black text-white"><Navbar/><main><Suspense><PricingExperience/></Suspense></main><Footer/></div>}
