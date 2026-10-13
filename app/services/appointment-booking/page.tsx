import { ServiceExperience } from '@/components/services/service-experience'
import {serviceBySlug} from '@/components/services/catalog'
export const metadata = {title: 'Booking systems | Koryx',description:serviceBySlug('appointment-booking')?.summary}
export default function Page(){return <ServiceExperience slug='appointment-booking'/>}
