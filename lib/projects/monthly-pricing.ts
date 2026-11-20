import type {Estimate,ProjectType} from '@/lib/project-planner/catalog'
// Planning rules v1, CAD. AI reviews scope; it never authorizes a charge.
const care:Record<ProjectType,number>={landing:79,website:129,store:199,app:299,feature:99}
const up=(amount:number)=>Math.ceil((amount+1)/10)*10-1
export function monthlyEstimate(type:ProjectType,estimate:Pick<Estimate,'total'|'low'|'high'>){
 const operations=care[type]
 return {version:1 as const,operations,development:up(estimate.total/12),total:up(operations+estimate.total/12),low:up(operations+estimate.low/12),high:up(operations+estimate.high/12),currency:'CAD' as const,interval:'month' as const}
}
export const managedIncludes=['Agreed design, development and launch','Managed hosting within agreed usage limits','Connected project activity dashboard','Maintenance and small content updates within the agreed allowance']
export const managedTerms='Monthly service access, not a purchase or instalment plan. No source-code transfer. No minimum term in this estimate; cancel future renewals before the next charge. Service continues through the paid period. Final price, included usage, update allowance and start date are confirmed in your individual offer. Domains, paid APIs, payment fees, major new features and applicable taxes are separate unless expressly included.'
