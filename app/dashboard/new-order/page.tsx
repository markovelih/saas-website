import {RequestEntry} from '@/components/workspace/request-entry'
import {redirect} from 'next/navigation'
import { workspaceSession,isFounder } from '@/lib/workspace'
import { ProjectPlanner } from '@/components/workspace/project-planner'
import { projectTypes, normalizeFeatures, MIN_PROJECT_BUDGET, MAX_PROJECT_BUDGET, type ProjectType } from '@/lib/project-planner/catalog'
export default async function NewOrderPage({searchParams}:{searchParams:Promise<{budget?:string;type?:string;intent?:string;pages?:string;features?:string;mode?:string}>}){
  const query=await searchParams
  const hasScope=query.intent==='build'||Boolean(query.budget||query.type)
  const type=projectTypes.some(p=>p.id===query.type)?query.type as ProjectType:'website'
  const budget=Math.max(MIN_PROJECT_BUDGET,Math.min(MAX_PROJECT_BUDGET,Math.round(Number(query.budget)||projectTypes.find(p=>p.id===type)!.base)))
  const basePages=projectTypes.find(p=>p.id===type)!.pages
  const pages=Math.max(basePages,Math.min(30,Math.floor(Number(query.pages)||basePages)))
  const features=normalizeFeatures(type,(query.features||'').split(','))
  const {user}=await workspaceSession()
  if(isFounder(user.id))redirect('/dashboard/admin')
  if(!hasScope)return <RequestEntry/>
  return <ProjectPlanner email={user.email||''} initialMode={query.mode==='managed'?'managed':'buyout'} initialBudget={budget} initialType={type} initialPages={pages} initialFeatures={features}/>
}
