import {z} from 'zod'
import {billingItemsSchema,discountSchema,moneyValue} from './schema'
import {totals,itemTotals,discountBreakdown} from './pricing'
import {validateServiceChanges} from './service-catalog'
import type {BillingSettings,EstimateSnapshot} from './types'
import {brandedEmail,escapeHtml} from './email'
import {formatAmount} from './pdf'

export const estimateSchema=z.object({
 email:z.string().trim().email('Enter a valid recipient email.').max(150),
 customer_name:z.string().trim().max(150).default(''),
 project_name:z.string().trim().max(150).default(''),
 items:billingItemsSchema,
 discount:discountSchema,
 base_price:moneyValue.nullable(),
 origin:z.enum(['koryx','external']),
 request_id:z.string().uuid(),
})
export function estimateSnapshot(input:z.infer<typeof estimateSchema>,seller:BillingSettings,issuedAt:string):EstimateSnapshot{
 const items=(input.items.length?input.items:input.base_price!==null?[{service_code:'custom',description:input.project_name||'Project development',quantity:1,unit_price:input.base_price}]:[])
 if(!items.length)throw new Error('Add services or a price before sending the estimate.')
 const error=validateServiceChanges(items,input.discount,[],undefined,input.origin);if(error)throw new Error(error)
 return {version:1,document_purpose:'estimate',invoice_number:'EST-'+input.request_id.replaceAll('-','').slice(0,12).toUpperCase(),receipt_number:'',issued_at:issuedAt,paid_at:issuedAt,currency:'CAD',seller:{...seller,seller_address:'',tax_id:'',tax_rate:0},customer:{name:input.customer_name||input.email,email:input.email,address:''},project:{id:'',name:input.project_name||'Your project'},items:items.map(item=>({...item,...itemTotals(item)})),...totals(items,input.discount),...discountBreakdown(items,input.discount),discount:input.discount,tax:0,settled:false,method:'other',reference:'',crypto_amount:''}
}
export function estimateEmail(p:EstimateSnapshot){
 const e=escapeHtml
 return brandedEmail(`<p class="email-muted" style="color:#666;font-size:13px;margin-top:28px">For your information · No payment is requested</p><h1 style="font-size:28px;margin:20px 0 8px">Your project estimate</h1><p style="font-size:14px;overflow-wrap:anywhere">${e(p.project.name)}</p>${p.discount_amount?`<p style="color:#777;font-size:18px;margin-bottom:0"><s>${formatAmount(p.subtotal)} CAD</s></p>`:''}<p style="font-size:40px;font-weight:700;margin:10px 0">${formatAmount(p.total)} <span style="font-size:16px">CAD</span></p><p class="email-muted" style="font-size:14px;line-height:1.8;color:#666">This is a preliminary cost estimate, not an invoice for payment. It creates no order, debt or payment obligation. We will confirm the scope and final price with you before work begins.</p><table width="100%" style="font-size:13px;line-height:1.8">${p.items.map(i=>`<tr><td style="padding:12px 0;overflow-wrap:anywhere">${e(i.description)}<br/><span style="color:#888">Qty ${i.quantity} × ${formatAmount(i.unit_price)}</span>${i.discount_amount?`<br/>Service discount${i.discount?.type==='percent'?' ('+i.discount.value+'%)':''}: −${formatAmount(i.discount_amount)}`:''}</td><td align="right" style="white-space:nowrap">${i.discount_amount?`<s style="color:#777">${formatAmount(i.gross_amount||0)}</s><br/>`:''}${formatAmount(i.amount)}</td></tr>`).join('')}<tr><td>Subtotal</td><td align="right">${formatAmount(p.subtotal)}</td></tr>${p.service_discount_amount?`<tr><td>Service discounts</td><td align="right">−${formatAmount(p.service_discount_amount)}</td></tr>`:''}${p.order_discount_amount?`<tr><td>Order discount${p.discount?.type==='percent'?' ('+p.discount.value+'%)':''}</td><td align="right">−${formatAmount(p.order_discount_amount)}</td></tr>`:''}<tr><td style="padding-top:14px"><b>Estimated total</b></td><td align="right"><b>${formatAmount(p.total)} CAD</b></td></tr></table><p style="font-size:12px;color:#777;margin-top:28px">Estimate number: ${e(p.invoice_number)}</p><p>The detailed estimate PDF is attached. Reply to this email to discuss the scope or request changes.</p>`)
}
