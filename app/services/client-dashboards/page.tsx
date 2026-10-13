import { ServiceExperience } from '@/components/services/service-experience'
import {serviceBySlug} from '@/components/services/catalog'
export const metadata = {title: 'Dashboards & client portals | Koryx',description:serviceBySlug('client-dashboards')?.summary}
export default function Page(){return <ServiceExperience slug='client-dashboards'/>}
