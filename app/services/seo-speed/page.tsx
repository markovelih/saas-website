import { ServiceExperience } from '@/components/services/service-experience'
import {serviceBySlug} from '@/components/services/catalog'
export const metadata = {title: 'Performance & SEO | Koryx',description:serviceBySlug('seo-speed')?.summary}
export default function Page(){return <ServiceExperience slug='seo-speed'/>}
