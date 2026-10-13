import type {BillingItem,Discount} from './types'
export type WorkKind='project'|'addition'|'repair'|'diagnostic'
export type WorkOrigin='koryx'|'external'
export const workKinds:Record<WorkKind,string>={project:'New build',addition:'Additional work',repair:'Fix or update',diagnostic:'Diagnostic review'}
export const standardDiscounts=[0,5,10,15,20,25,30]
export const highDiscounts=[35,40,45,50,60,70]
export const serviceCatalog=[
 {code:'pages',description:'Website pages',price:150,min:75,max:400},
 {code:'design',description:'Design & animation',price:500,min:150,max:2000},
 {code:'admin',description:'Admin panel',price:600,min:250,max:2500},
 {code:'booking',description:'Booking system',price:500,min:200,max:2000},
 {code:'payments',description:'Payment integration',price:400,min:150,max:1500},
 {code:'seo',description:'SEO & performance',price:250,min:100,max:1000},
 {code:'email',description:'Email integration',price:150,min:75,max:600},
 {code:'feature',description:'Custom feature',price:300,min:50,max:5000},
 {code:'diagnostic',description:'Diagnostic review',price:50,min:25,max:150},
 {code:'domain',description:'Domain',price:30,min:1,max:1000000},
 {code:'custom',description:'Custom service',price:150,min:25,max:10000},
] as const
export function serviceRule(item:BillingItem){return serviceCatalog.find(r=>r.code===item.service_code)||serviceCatalog.find(r=>r.description===item.description)||serviceCatalog.find(r=>r.code===(item.description.startsWith('Domain — ')?'domain':'custom'))!}
export function servicePreset(code:string,origin:WorkOrigin='koryx',repeat=false):BillingItem{
 const r=serviceCatalog.find(r=>r.code===code)||serviceCatalog.find(r=>r.code==='custom')!
 const external=origin==='external'&&r.code!=='diagnostic'&&r.code!=='domain'
 return {service_code:r.code,description:r.description,quantity:1,unit_price:external?Math.round(r.price*1.25):r.price,...(repeat&&!external&&!['domain','diagnostic'].includes(r.code)?{discount:{type:'percent' as const,value:15}}:{})}
}
export function allowedPrice(item:BillingItem,origin:WorkOrigin='koryx'){
 const r=serviceRule(item),factor=origin==='external'&&!['domain','diagnostic'].includes(r.code)?1.25:1
 return {min:Math.ceil(r.min*factor),max:Math.ceil(r.max*factor)}
}
export function validateDiscount(discount:Discount){
 if(!discount.value)return null
 if(discount.type!=='percent')return 'Choose a percentage discount preset.'
 if(!(discount.high_approved? [...standardDiscounts,...highDiscounts]:standardDiscounts).includes(discount.value))return 'Choose an allowed discount. Enable high discount in advanced settings for more options.'
 return null
}
// Existing issued rows remain readable. New or changed rows must follow the catalogue.
export function validateServiceChanges(items:BillingItem[],discount:Discount,previous:BillingItem[]=[],oldDiscount?:Discount,origin:WorkOrigin='koryx'){
 for(const item of items){
  if(previous.some(p=>JSON.stringify(p)===JSON.stringify(item)))continue
  const range=allowedPrice(item,origin),rule=serviceRule(item)
  if(item.unit_price<range.min||item.unit_price>range.max)return `${rule.description}: price must be CAD ${range.min}–${range.max}.`
  if(rule.code!=='domain'&&!Number.isInteger(item.unit_price))return 'Service prices must use whole CAD amounts.'
  const error=validateDiscount(item.discount||{type:'percent',value:0});if(error)return error
 }
 if(JSON.stringify(discount)!==JSON.stringify(oldDiscount)){const error=validateDiscount(discount);if(error)return error}
 return null
}

export function validateDiagnostic(items:BillingItem[]){return items.length===1&&serviceRule(items[0]).code==='diagnostic'&&items[0].quantity===1?null:'Diagnostics require one diagnostic review service. Quote repairs separately.'}
