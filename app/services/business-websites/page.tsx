import { WebsiteExperience } from '@/components/services/website-experience'
import {serviceBySlug} from '@/components/services/catalog'
export const metadata = {title: 'Business websites | Koryx',description:serviceBySlug('business-websites')?.summary}
export default function Page(){return <WebsiteExperience/>}
