import type { Estimate, PlannerInput } from './catalog'
export const planMarker='KORYX_PLAN_V1\n'
export interface PlanSnapshot {input:PlannerInput;estimate:Estimate;brief:string;domains?:{hostname:string;price:number;renewal_price:number|null}[]}
export function serializePlan(plan:PlanSnapshot){return planMarker+JSON.stringify(plan)}
export function readPlan(description:string):PlanSnapshot|null{
 if(!description.startsWith(planMarker))return null
 try{const p=JSON.parse(description.slice(planMarker.length));if(p.estimate?.version!==1||!Array.isArray(p.estimate.items)||typeof p.brief!=='string')return null;return p}catch{return null}
}
