import {founderClient} from '@/lib/supabase/admin'
import {billingSettings} from '@/lib/billing/service'
import {AdminPanelClient} from './admin-panel-client'
export default async function AdminPage({searchParams}:{searchParams:Promise<{view?:string;project?:string}>}){
 const query=await searchParams;const {supabase,user,profile}=await founderClient();
 const [orders,profiles,payments,billing]=await Promise.all([supabase.from('orders').select('*').order('created_at',{ascending:false}),supabase.from('profiles').select('id,email,full_name,role,created_at').order('created_at',{ascending:false}),supabase.from('project_payments').select('*').order('created_at',{ascending:false}),billingSettings(supabase)]);
 if(orders.error||profiles.error||payments.error)return <p role="alert">Studio data could not be loaded. Please refresh.</p>;
 const view=query.view==='clients'?'clients':query.view==='list'?'list':query.view==='billing'?'billing':'board';
 return <AdminPanelClient key={view+query.project} initialView={view} initialProject={query.project} orders={orders.data||[]} profiles={profiles.data||[]} payments={payments.data||[]} billing={billing} mailConfigured={Boolean(process.env.RESEND_API_KEY)} user={{email:user.email,fullName:profile?.full_name||'Founder'}}/>
}
