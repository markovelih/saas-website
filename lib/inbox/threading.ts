import {messageKey,type InboxEmail} from './types'
export const mailIds=(value?:string)=>[...new Set((value||'').slice(0,32000).match(/<[^<>\s\x00-\x1f]{1,998}>/g)||[])].filter(id=>new TextEncoder().encode(id).byteLength<=1000).slice(0,32)
export function headerValue(headers:Record<string,string>|undefined,name:string){return Object.entries(headers||{}).find(([key])=>key.toLowerCase()===name.toLowerCase())?.[1]}
export function threadMetadata(email:InboxEmail):InboxEmail{
 return {id:email.id,direction:email.direction||'inbound',from:email.from,to:email.to,subject:email.subject,created_at:email.created_at,attachments:(email.attachments||[]).map(({id,filename,content_type,size,content_id})=>({id,filename,content_type,size,content_id})),reply_to:email.reply_to,
  message_id:mailIds(email.message_id)[0],in_reply_to:mailIds(email.in_reply_to).join(' ')||undefined,references:mailIds(email.references).join(' ')||undefined,
  reply_key:email.reply_key,draft_key:email.draft_key,thread_id:email.thread_id,headers_checked:email.headers_checked}
}
// Join only explicit parent links and RFC message identifiers. Sender and subject never join threads.
export function resolveMailThreads(emails:InboxEmail[]){
 const parents=new Map<string,string>()
 const find=(key:string):string=>{let root=key;const path:string[]=[];while(parents.has(root)&&parents.get(root)!==root){path.push(root);root=parents.get(root)!}if(!parents.has(root))parents.set(root,root);for(const item of path)parents.set(item,root);return root}
 const join=(a:string,b:string)=>{const x=find(a),y=find(b);if(x!==y)parents.set(y,x)}
 for(const email of emails){
  const node='email:'+messageKey(email);find(node)
  if(email.draft_key)join(node,'email:'+email.draft_key)
  if(email.reply_key)join(node,'email:'+email.reply_key)
  if(email.thread_id)join(node,'thread:'+email.thread_id)
  for(const id of [...mailIds(email.message_id),...mailIds(email.references),...mailIds(email.in_reply_to)])join(node,'rfc:'+id)
 }
 const groups=new Map<string,InboxEmail[]>()
 for(const email of emails){const root=find('email:'+messageKey(email));const group=groups.get(root);if(group)group.push(email);else groups.set(root,[email])}
 return [...groups.values()].map(items=>{
  const messages=items.sort((a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at)||messageKey(a).localeCompare(messageKey(b)))
  const explicit=messages.find(email=>email.thread_id)?.thread_id
  const root=messages.find(email=>!email.reply_key&&!mailIds(email.in_reply_to).length&&!mailIds(email.references).length)
  const first=messages[0],rootId=mailIds(root?.message_id)[0],missingRoot=mailIds(first.references)[0]||mailIds(first.in_reply_to)[0]
  const id=explicit||(rootId?'rfc:'+rootId:root?'mail:'+(root.draft_key||messageKey(root)):missingRoot?'rfc:'+missingRoot:'mail:'+(first.draft_key||messageKey(first)))
  const aliases=new Set([id])
  for(const email of messages){aliases.add('mail:'+messageKey(email));if(email.draft_key)aliases.add('mail:'+email.draft_key);if(email.thread_id)aliases.add(email.thread_id);for(const ref of [...mailIds(email.message_id),...mailIds(email.references),...mailIds(email.in_reply_to)])aliases.add('rfc:'+ref)}
  return {id,aliases:[...aliases],messages}
 })
}
export function withThreadIds(emails:InboxEmail[],index:InboxEmail[]=[]){
 const keys=new Map<string,string>()
 // Enriched index wins over sparse metadata; current message content is returned unchanged.
 const all=new Map([...emails,...index].map(email=>[messageKey(email),email]))
 for(const thread of resolveMailThreads([...all.values()]))for(const email of thread.messages)keys.set(messageKey(email),thread.id)
 return emails.map(email=>({...email,thread_id:keys.get(messageKey(email))||email.thread_id}))
}
