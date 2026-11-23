import { ServiceExperience } from '@/components/services/service-experience'
import { serviceMetadata } from '@/lib/seo'
import { ServiceData } from '@/components/seo/structured-data'
export const metadata = serviceMetadata('client-dashboards')
export default function Page(){return <><ServiceData slug="client-dashboards"/><ServiceExperience slug='client-dashboards'/></>}
