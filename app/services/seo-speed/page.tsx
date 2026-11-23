import { ServiceExperience } from '@/components/services/service-experience'
import { serviceMetadata } from '@/lib/seo'
import { ServiceData } from '@/components/seo/structured-data'
export const metadata = serviceMetadata('seo-speed')
export default function Page(){return <><ServiceData slug="seo-speed"/><ServiceExperience slug='seo-speed'/></>}
