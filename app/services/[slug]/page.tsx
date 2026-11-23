import { notFound } from 'next/navigation'
import { ServiceExperience } from '@/components/services/service-experience'
import { ServiceData } from '@/components/seo/structured-data'
import { isServiceSlug, serviceMetadata } from '@/lib/seo'

const serviceSlugs = ['custom-software', 'e-commerce', 'integrations', 'security']
export function generateStaticParams() { return serviceSlugs.map(slug => ({ slug })) }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!isServiceSlug(slug) || !serviceSlugs.includes(slug)) notFound()
  return serviceMetadata(slug)
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  if (!isServiceSlug(slug) || !serviceSlugs.includes(slug)) notFound()
  return <><ServiceData slug={slug} /><ServiceExperience slug={slug} /></>
}
