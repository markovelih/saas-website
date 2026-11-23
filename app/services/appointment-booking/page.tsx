import { ServiceExperience } from '@/components/services/service-experience'
import { serviceMetadata } from '@/lib/seo'
import { ServiceData } from '@/components/seo/structured-data'
export const metadata = serviceMetadata('appointment-booking')
export default function Page(){return <><ServiceData slug="appointment-booking"/><ServiceExperience slug='appointment-booking'/></>}
