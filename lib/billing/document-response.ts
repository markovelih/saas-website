import 'server-only'
import {billingPdf} from './pdf'
import {documentPath,documentHeaders,type DocumentKind} from './document-view'
import type {BillingSnapshot} from './types'

export async function documentResponse(request:Request,snapshot:BillingSnapshot,kind:DocumentKind){
 const query=new URL(request.url).searchParams,download=query.get('download')==='1'
 if(kind==='receipt'&&(snapshot.settled===false||!snapshot.receipt_number))return new Response('Not found',{status:404,headers:{'Cache-Control':'private, no-store'}})
 // Existing account links now open a stable document page. Only an explicit download saves a file.
 if(!download&&query.get('inline')!=='1')return new Response(null,{status:307,headers:{Location:documentPath(snapshot,kind),'Cache-Control':'private, no-store','Referrer-Policy':'no-referrer'}})
 return new Response(new Uint8Array(await billingPdf(snapshot,kind)),{headers:documentHeaders(snapshot,kind,download)})
}
