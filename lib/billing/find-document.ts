import 'server-only'
import type {SupabaseClient} from '@supabase/supabase-js'
import type {Database} from '@/lib/supabase/types'
import {parseDocumentPath} from './document-view'

export async function findBillingDocument(db:SupabaseClient<Database>,path:string){
 const parsed=parseDocumentPath(path)
 if(!parsed)return null
 const field='snapshot->>'+parsed.kind+'_number'
 // Authenticated client only: every source applies its existing owner/founder RLS.
 // Prefer the settled transaction over its original payment request with the same invoice number.
 const results=await Promise.all([
  db.from('payment_transactions').select('snapshot').eq(field,parsed.number).order('created_at',{ascending:false}).limit(1).maybeSingle(),
  db.from('project_payments').select('snapshot').eq(field,parsed.number).order('created_at',{ascending:false}).limit(1).maybeSingle(),
  db.from('domain_renewals').select('snapshot').eq(field,parsed.number).neq('status','cancelled').order('created_at',{ascending:false}).limit(1).maybeSingle(),
  ...(parsed.kind==='invoice'?[
   db.from('project_invoices').select('snapshot').eq(field,parsed.number).order('created_at',{ascending:false}).limit(1).maybeSingle(),
   db.from('payment_requests').select('snapshot').eq(field,parsed.number).order('created_at',{ascending:false}).limit(1).maybeSingle()
  ]:[])
 ])
 if(results.some(result=>result.error))throw new Error('Document lookup is temporarily unavailable')
 const snapshot=results.map(result=>result.data?.snapshot).find(value=>value&&value.document_purpose!=='estimate'&&(parsed.kind!=='receipt'||value.settled!==false))
 return snapshot?{...parsed,snapshot}:null
}
