import type {Installment,Transaction} from './types'
export function installmentCents(total:number,paid:number,kind:Installment){
 if(!Number.isSafeInteger(total)||!Number.isSafeInteger(paid)||total<=0||paid<0)throw new Error('Invalid payment amounts.')
 const remaining=Math.max(0,total-paid)
 return kind==='deposit'?Math.max(0,Math.ceil(total/2)-paid):remaining
}
export const collectedCents=(rows:Pick<Transaction,'amount_cents'|'refunded_cents'>[])=>rows.reduce((sum,p)=>sum+p.amount_cents-p.refunded_cents,0)
export const stageTitle=(kind:Installment)=>({deposit:'50% deposit',balance:'Final balance',full:'Full project payment'}[kind])
