import {readInboxPage,readInboxEmail} from '@/lib/inbox/server'
import {SupportInbox} from '@/components/manager/support-inbox'
export const maxDuration=300
export default async function WorkInboxPage({searchParams}:{searchParams:Promise<{email?:string}>}){
 const initial=await readInboxPage(undefined,'ceo'),query=await searchParams
 let initialEmail
 try{if(query.email)initialEmail=await readInboxEmail(query.email,true,'inbound',false,'ceo')}catch{}
 return <SupportInbox key="ceo" account="ceo" initial={initial} initialEmail={initialEmail}/>
}
