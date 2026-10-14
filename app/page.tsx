import { Navbar } from '@/components/vercel-home/navbar'
import { Hero } from '@/components/vercel-home/hero'
import { WorkShowcase, ProcessSection, FAQSection } from '@/components/vercel-home/features'
import {HomeFoundations,HomeServices,ProjectBlueprint} from '@/components/vercel-home/home-system'
import {ProjectKit} from '@/components/motion/project-kit'
import home from '@/components/vercel-home/home-system.module.css'
import { Footer } from '@/components/vercel-home/footer'

export default function HomePage() {
  return <div className="bg-black text-white min-h-screen overflow-x-clip"><Navbar/><main><Hero/><div className={home.frame}><WorkShowcase/><HomeServices/><ProjectBlueprint/><HomeFoundations/><ProjectKit/><ProcessSection/><FAQSection/></div></main><Footer/></div>
}
