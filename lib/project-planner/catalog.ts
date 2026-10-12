export const projectTypes = [
 {id:'landing',title:'Landing page',description:'One focused page that turns visitors into enquiries.',base:500,pages:1,weeks:1},
 {id:'website',title:'Business website',description:'A complete website built around your brand.',base:1500,pages:5,weeks:3},
 {id:'store',title:'Online store',description:'A storefront, catalogue and hosted checkout integration.',base:3000,pages:5,weeks:4},
 {id:'app',title:'Application / SaaS',description:'Your own product, portal or internal business tool.',base:5000,pages:5,weeks:6},
 {id:'feature',title:'Feature / integration',description:'Improve the software you already have.',base:500,pages:1,weeks:1},
] as const
export const featureCatalog = [
 {id:'motion',title:'Signature animation',description:'Scroll choreography, animated graphics and refined transitions.',price:500,group:'Experience'},
 {id:'cms',title:'Editable content',description:'Manage your pages and articles without editing code.',price:400,group:'Experience'},
 {id:'booking',title:'Online booking',description:'Service selection, availability and booking requests.',price:700,group:'Business'},
 {id:'payments',title:'Online payments',description:'Hosted checkout with a payment provider.',price:500,group:'Business'},
 {id:'accounts',title:'Customer accounts',description:'Secure sign-in, recovery and user permissions.',price:700,group:'Software'},
 {id:'dashboard',title:'Management dashboard',description:'Manage your workflow. Requires customer accounts unless already included.',price:1000,group:'Software'},
 {id:'integration',title:'One API integration',description:'Connect a supported CRM, email or business API.',price:600,group:'Software'},
 {id:'ai',title:'AI-powered feature',description:'One defined AI workflow with a model provider.',price:1200,group:'Software'},
 {id:'multilingual',title:'Second language',description:'One additional language with supplied translations.',price:350,group:'Experience'},
 {id:'security',title:'Advanced security setup',description:'App-specific firewall rules, alerts and access review.',price:600,group:'Infrastructure'},
] as const
export const includedEssentials = ['Custom responsive design','Contact form / core workflow','Technical SEO foundations','HTTPS & provider DDoS protection','Testing & launch setup']
export const budgetPresets = [500,1500,3000,5000,10000]
export type ProjectType = typeof projectTypes[number]['id']
export interface PlannerInput {type:ProjectType;budget:number;pages:number;features:string[];brief:string}
export interface Estimate {version:1;currency:'CAD';total:number;low:number;high:number;budget:number;withinBudget:boolean;weeks:[number,number];items:{label:string;amount:number}[];features:string[];complexity:'standard'|'complex';source:'calculator'|'ai';summary:string;questions:string[];deferred:string[]}
export function money(value:number){return new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',minimumFractionDigits:0,maximumFractionDigits:2}).format(value)}
export function normalizeFeatures(type:ProjectType, ids:string[]){
 const result=new Set(ids.filter(id=>featureCatalog.some(f=>f.id===id)))
 if(type==='store')result.delete('payments') // Checkout is included in the store base.
 if(type==='app'){result.delete('accounts');result.delete('dashboard')} // Core account/dashboard flow included.
 if(result.has('dashboard'))result.add('accounts')
 return [...result].sort()
}
export function buildEstimate(input:PlannerInput, complexity:'standard'|'complex'='standard'):Estimate{
 const type=projectTypes.find(p=>p.id===input.type)!
 const features=normalizeFeatures(input.type,input.features)
 const items:{label:string;amount:number}[]=[{label:type.title,amount:type.base}]
 const extra=Math.max(0,input.pages-type.pages)
 if(extra)items.push({label:`${extra} additional page${extra===1?'':'s'}`,amount:extra*150})
 for(const id of features){const feature=featureCatalog.find(f=>f.id===id)!;items.push({label:feature.title,amount:feature.price})}
 const subtotal=items.reduce((sum,i)=>sum+i.amount,0)
 if(complexity==='complex')items.push({label:'Complex workflow allowance',amount:Math.ceil(subtotal*.2/50)*50})
 const total=items.reduce((sum,i)=>sum+i.amount,0)
 const weeks=type.weeks+Math.ceil(features.length/2)+Math.ceil(extra/5)+(complexity==='complex'?2:0)
 return {version:1,currency:'CAD',total,low:total,high:Math.ceil(total*1.2/50)*50,budget:input.budget,withinBudget:total<=input.budget,weeks:[weeks,weeks+2],items,features,complexity,source:'calculator',summary:'A starting estimate for the selected scope. Koryx confirms the deliverables and final quote before work begins.',questions:[],deferred:[]}
}
export function budgetFeatures(type:ProjectType,budget:number,pages:number,priority:string[]=['motion','cms','booking','integration','multilingual']){
 const selected:string[]=[]
 for(const id of priority){const next=normalizeFeatures(type,[...selected,id]);if(buildEstimate({type,budget,pages,features:next,brief:''}).total<=budget)selected.splice(0,selected.length,...next)}
 return selected
}
export const statusLabels={pending:'Brief received',in_review:'Scope review',invoice_sent:'Quote & invoice',paid:'Ready to build',in_progress:'In development',completed:'Delivered'}
export function nextStep(status:string){return ({pending:'Koryx will review your brief and check the scope.',in_review:'We are reviewing requirements before preparing your quote.',invoice_sent:'Review your agreed quote and the invoice sent separately.',paid:'Payment is recorded. Your build can move forward.',in_progress:'Development is underway. Koryx will share review details directly.',completed:'Your project has been marked as delivered.'} as Record<string,string>)[status]||'Your project is being reviewed.'}
