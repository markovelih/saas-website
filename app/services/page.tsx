import { pageMetadata, publicSearchPages } from '@/lib/seo'
import { ServicesOverview } from '@/components/services/service-experience'
export const metadata = pageMetadata('/services', publicSearchPages['/services'])
export default function Page(){return <ServicesOverview/>}
