import {founderClient} from '@/lib/supabase/admin'
export default async function LegacyAdminLayout({children}:{children:React.ReactNode}){await founderClient();return children}
