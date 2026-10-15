import type {BillingSnapshot} from './types'

export type DocumentKind='invoice'|'receipt'
export function documentPath(snapshot:BillingSnapshot,kind:DocumentKind){
 const number=kind==='invoice'?snapshot.invoice_number:snapshot.receipt_number
 if(!number||!/^[A-Za-z0-9-]{1,100}$/.test(number))throw new Error('Invalid document number')
 return '/'+kind+'-'+number
}
export function parseDocumentPath(value:string){
 const match=/^(invoice|receipt)-([A-Za-z0-9-]{1,100})$/.exec(value)
 return match?{kind:match[1] as DocumentKind,number:match[2]}:null
}
export function documentHeaders(snapshot:BillingSnapshot,kind:DocumentKind,download:boolean){
 const number=kind==='invoice'?snapshot.invoice_number:snapshot.receipt_number
 return {'Content-Type':'application/pdf','Content-Disposition':`${download?'attachment':'inline'}; filename="Koryx-${kind}-${number.replace(/[^A-Za-z0-9-]/g,'')}.pdf"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','X-Robots-Tag':'noindex, nofollow','Referrer-Policy':'no-referrer'}
}
