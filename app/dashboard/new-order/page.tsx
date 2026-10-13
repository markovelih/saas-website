import {RequestEntry} from '@/components/workspace/request-entry'
import {redirect} from 'next/navigation'
import { workspaceSession,isFounder } from '@/lib/workspace'
import { ProjectPlanner } from '@/components/workspace/project-planner'
import { projectTypes, normalizeFeatures, type ProjectType } from '@/lib/project-planner/catalog'
export default async function NewOrderPage({searchParams}:{searchParams:Promise<{budget?:string;type?:string;intent?:string;pages?:string;features?:string}>}){
  const query=await searchParams
  const hasScope=query.intent==='build'||Boolean(query.budget||query.type)
  const budget=Math.max(500,Math.min(50000,Number(query.budget)||1500))
  const type=projectTypes.some(p=>p.id===query.type)?query.type as ProjectType:'website'
  const basePages=projectTypes.find(p=>p.id===type)!.pages
  const pages=Math.max(basePages,Math.min(30,Math.floor(Number(query.pages)||basePages)))
  const features=normalizeFeatures(type,(query.features||'').split(','))
  const {user}=await workspaceSession()
  if(isFounder(user.id))redirect('/dashboard/admin')
  if(!hasScope)return <RequestEntry/>
  return <ProjectPlanner email={user.email||''} initialBudget={budget} initialType={type} initialPages={pages} initialFeatures={features}/>
}
