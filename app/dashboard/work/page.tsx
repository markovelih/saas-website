import {redirect} from 'next/navigation'
import {workspaceSession,clientOrderColumns,isFounder} from '@/lib/workspace'
import {WorkRequest} from '@/components/workspace/work-request'
import type {Order} from '@/lib/supabase/types'
export default async function WorkPage({searchParams}:{searchParams:Promise<{project?:string}>}){const {user,supabase}=await workspaceSession();if(isFounder(user.id))redirect('/dashboard/admin');const query=await searchParams;const {data,error}=await supabase.from('orders').select(clientOrderColumns).eq('user_id',user.id).is('parent_order_id',null).order('created_at',{ascending:false});if(error)return <p role="alert">Projects could not be loaded. Please refresh.</p>;const projects=(data||[]) as Order[];return <WorkRequest projects={projects} initialParent={projects.some(p=>p.id===query.project)?query.project:undefined}/>}
