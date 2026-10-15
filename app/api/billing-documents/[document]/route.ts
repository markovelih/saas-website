import {createClient} from '@/lib/supabase/server'
import {findBillingDocument} from '@/lib/billing/find-document'
import {documentResponse} from '@/lib/billing/document-response'
import {parseDocumentPath} from '@/lib/billing/document-view'
export const runtime='nodejs'
export async function GET(request:Request,{params}:{params:Promise<{document:string}>}){
 const {document}=await params,headers={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'}
 if(!parseDocumentPath(document))return new Response('Not found',{status:404,headers})
 const db=await createClient(),{data:{user}}=await db.auth.getUser()
 if(!user)return new Response('Sign in to view your document',{status:401,headers})
 try{
  const found=await findBillingDocument(db,document)
  if(!found)return new Response('Not found',{status:404,headers})
  const url=new URL(request.url);if(url.searchParams.get('download')!=='1')url.searchParams.set('inline','1')
  return documentResponse(new Request(url,request),found.snapshot,found.kind)
 }catch{return new Response('The document is temporarily unavailable. Please retry.',{status:503,headers})}
}
