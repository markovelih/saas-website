import { notFound } from 'next/navigation'
import { ServiceDetail } from '@/components/vercel-home/features'
const serviceSlugs = ['custom-software', 'e-commerce', 'integrations', 'security']
export function generateStaticParams() { return serviceSlugs.map(slug=>({slug})) }
export async function generateMetadata({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params
  const titles: Record<string,string> = {'custom-software':'Apps & custom software','e-commerce':'E-commerce','integrations':'Integrations & features','security':'Security & launch'}
  return {title:`${titles[slug]||'Services'} | Koryx`}
}
export default async function Page({params}:{params:Promise<{slug:string}>}) {
  const {slug}=await params
  if(!serviceSlugs.includes(slug)) notFound()
  return <ServiceDetail slug={slug}/>
}
