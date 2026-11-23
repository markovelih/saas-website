import { pageMetadata, publicSearchPages } from '@/lib/seo'
import {ServiceModels} from '@/components/projects/service-models'
import { Navbar } from '@/components/vercel-home/navbar'
import { Hero } from '@/components/vercel-home/hero'
import { ProcessSection, FAQSection } from '@/components/vercel-home/features'
import {HomeServices} from '@/components/vercel-home/home-system'
import {ProjectKit} from '@/components/motion/project-kit'
import home from '@/components/vercel-home/home-system.module.css'
import { Footer } from '@/components/vercel-home/footer'

export const metadata = pageMetadata('/', publicSearchPages['/'])

export default function HomePage() {
  return <div className="bg-black text-white min-h-screen overflow-x-clip"><Navbar/><main><Hero/><div className={home.frame}><HomeServices/><ServiceModels/><ProjectKit/><ProcessSection compact/><FAQSection compact/></div></main><Footer/></div>
}
