import {connection} from 'next/server'
import {notFound} from 'next/navigation'
import {DocumentViewer} from '@/components/billing/document-viewer'
import {parseDocumentPath} from '@/lib/billing/document-view'

export const metadata={title:'Document | Koryx',robots:{index:false,follow:false},referrer:'no-referrer' as const}
export default async function DocumentPage({params}:{params:Promise<{document:string}>}){
 await connection()
 const {document}=await params
 if(!parseDocumentPath(document))notFound()
 return <DocumentViewer document={document}/>
}
