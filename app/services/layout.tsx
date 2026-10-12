import { Navbar } from '@/components/vercel-home/navbar'
import { Footer } from '@/components/vercel-home/footer'
export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-black text-white overflow-x-hidden"><Navbar/><main>{children}</main><Footer/></div>
}
