import { WebsiteExperience } from '@/components/services/website-experience'
import { serviceMetadata } from '@/lib/seo'
import { ServiceData } from '@/components/seo/structured-data'
export const metadata = serviceMetadata('business-websites')
export default function Page(){return <><ServiceData slug="business-websites"/><WebsiteExperience/></>}
