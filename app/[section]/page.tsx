import { notFound } from 'next/navigation'
import { Navbar } from '@/components/vercel-home/navbar'
import { Footer } from '@/components/vercel-home/footer'
import { WorkShowcase, ProcessSection, FAQSection, ProjectButtons } from '@/components/vercel-home/features'
const titles:Record<string,string>={work:'Design concepts & solutions',process:'Our project process',faq:'Frequently asked questions',contact:'Start your project'}
export function generateStaticParams(){return Object.keys(titles).map(section=>({section}))}
export async function generateMetadata({params}:{params:Promise<{section:string}>}){const {section}=await params;return {title:`${titles[section]||'Page'} | Koryx`}}
export default async function Page({params}:{params:Promise<{section:string}>}){
 const {section}=await params
 if(!titles[section])notFound()
 return <div className="bg-black text-white min-h-screen overflow-x-hidden"><Navbar/><main className="pt-16">{section==='work'?<WorkShowcase/>:section==='process'?<ProcessSection/>:section==='faq'?<FAQSection/>:<div className="max-w-4xl mx-auto px-6 py-24"><p className="text-white/40 text-sm mb-5">LET’S BUILD YOUR IDEA</p><h1 className="text-5xl sm:text-7xl font-semibold tracking-tight mb-8">Tell us what<br/>you have in mind.</h1><p className="text-lg text-white/50 max-w-xl leading-relaxed">Use your client account to send a project brief with the features, references, and budget you have in mind. We will review it and agree on the scope with you.</p><ProjectButtons/><p className="mt-6 text-sm text-white/35">Already a client? Sign in to continue. New to Koryx? Create an account to submit your project.</p></div>}</main><Footer/></div>
}
