import { workspaceSession } from '@/lib/workspace'
import { ProjectPlanner } from '@/components/workspace/project-planner'
import { projectTypes, type ProjectType } from '@/lib/project-planner/catalog'
export default async function NewOrderPage({searchParams}:{searchParams:Promise<{budget?:string;type?:string}>}){const {user}=await workspaceSession();const query=await searchParams;const budget=Math.max(500,Math.min(50000,Number(query.budget)||1500));const type=projectTypes.some(p=>p.id===query.type)?query.type as ProjectType:'website';return <ProjectPlanner email={user.email||''} initialBudget={budget} initialType={type}/>}
