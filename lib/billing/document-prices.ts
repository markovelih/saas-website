import type {BillingSnapshot} from './types'
import {cents} from './pricing'

// Read the frozen document amounts, never the current catalog/discount rules.
// Older snapshots may store a subtotal that already includes service discounts.
export function documentPriceStages(snapshot:BillingSnapshot){
 const original=snapshot.items.length?snapshot.items.reduce((sum,item)=>sum+(item.gross_amount!==undefined?cents(item.gross_amount):cents(item.unit_price)*item.quantity),0):cents(snapshot.subtotal)
 const service=snapshot.service_discount_amount?cents(snapshot.service_discount_amount):snapshot.items.reduce((sum,item)=>sum+(item.discount_amount!==undefined?cents(item.discount_amount):item.discount?.value?Math.max(0,(item.gross_amount!==undefined?cents(item.gross_amount):cents(item.unit_price)*item.quantity)-cents(item.amount)):0),0)
 const afterServices=original-service
 // An installment's payment amount is separate from the agreed final project price.
 const final=cents(snapshot.project_total??snapshot.total)
 const order=snapshot.order_discount_amount?cents(snapshot.order_discount_amount):Math.max(0,afterServices-final)
 return {original:original/100,serviceDiscount:service/100,afterServices:afterServices/100,orderDiscount:order/100,final:final/100}
}
