import type {BillingItem,Discount} from './types'
import {isDiscountExempt} from './service-catalog'
export const cents=(n:number)=>Math.round((n+Number.EPSILON)*100)
export function discountCents(subtotal:number,discount?:Discount){
 const value=discount?.type==='percent'?Math.round(subtotal*discount.value/100):cents(discount?.value||0)
 return Math.min(subtotal,Math.max(0,value))
}
export function itemTotals(item:BillingItem){
 const gross=cents(item.unit_price)*item.quantity,off=isDiscountExempt(item)?0:discountCents(gross,item.discount)
 return {gross_amount:gross/100,discount_amount:off/100,amount:(gross-off)/100}
}
export function discountBreakdown(items:BillingItem[],discount?:Discount){
 const serviceCents=items.reduce((sum,i)=>sum+cents(itemTotals(i).discount_amount),0)
 const eligible=items.filter(i=>!isDiscountExempt(i)).reduce((sum,i)=>sum+cents(itemTotals(i).amount),0)
 return {service_discount_amount:serviceCents/100,order_discount_amount:discountCents(eligible,discount)/100}
}
export function totals(items:BillingItem[],discount:Discount={type:'amount',value:0}){
 const subtotalCents=items.reduce((sum,i)=>sum+cents(i.unit_price)*i.quantity,0)
 const breakdown=discountBreakdown(items,discount)
 const off=cents(breakdown.service_discount_amount)+cents(breakdown.order_discount_amount)
 return {subtotal:subtotalCents/100,discount_amount:off/100,total:(subtotalCents-off)/100}
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
