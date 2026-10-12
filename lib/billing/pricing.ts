import type {BillingItem,Discount} from './types'
export const cents=(n:number)=>Math.round((n+Number.EPSILON)*100)
export function totals(items:BillingItem[],discount:Discount={type:'amount',value:0}){
 const subtotalCents=items.reduce((sum,i)=>sum+cents(i.unit_price)*i.quantity,0)
 const discountCents=discount.type==='percent'?Math.round(subtotalCents*discount.value/100):cents(discount.value)
 return {subtotal:subtotalCents/100,discount_amount:Math.min(subtotalCents,discountCents)/100,total:Math.max(0,subtotalCents-discountCents)/100}
}
export function domainRetail(cost:number){return Math.ceil(cents(cost)*1.5)/100}
export const servicePresets:BillingItem[]=[
 {description:'Website pages',quantity:1,unit_price:150},
 {description:'Design & animation',quantity:1,unit_price:500},
 {description:'Admin panel',quantity:1,unit_price:600},
 {description:'Booking system',quantity:1,unit_price:500},
 {description:'Payment integration',quantity:1,unit_price:400},
 {description:'SEO & performance',quantity:1,unit_price:250},
 {description:'Email integration',quantity:1,unit_price:150},
 {description:'Custom feature',quantity:1,unit_price:0},
]
