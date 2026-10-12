import {redirect} from 'next/navigation'
import {workspaceSession,clientOrderColumns,isFounder} from '@/lib/workspace'
import {ProjectList} from '@/components/workspace/project-list'
import type {Order} from '@/lib/supabase/types'
export default async function OrdersPage(){const {supabase,user}=await workspaceSession();if(isFounder(user.id))redirect('/dashboard/admin?view=list');const {data,error}=await supabase.from('orders').select(clientOrderColumns).eq('user_id',user.id).order('created_at',{ascending:false});if(error)return <p role="alert">Your projects could not be loaded. Please refresh.</p>;return <ProjectList orders={(data||[]) as Order[]}/>}
