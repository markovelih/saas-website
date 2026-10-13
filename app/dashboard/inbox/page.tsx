import {readInboxPage,readInboxEmail} from '@/lib/inbox/server'
import {SupportInbox} from '@/components/manager/support-inbox'
export default async function InboxPage({searchParams}:{searchParams:Promise<{email?:string}>}){const initial=await readInboxPage();const query=await searchParams;let initialEmail;try{if(query.email)initialEmail=await readInboxEmail(query.email)}catch{}return <SupportInbox initial={initial} initialEmail={initialEmail}/>}
