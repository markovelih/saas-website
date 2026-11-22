export type InboxAttachment={id:string;filename:string;content_type:string;size:number;content_id?:string|null;preview_url?:string}
export type MailDirection='inbound'|'outbound'
export type InboxEmail={id:string;from:string;to:string[];subject:string;created_at:string;attachments:InboxAttachment[];text?:string;html?:string;body_html?:string;inline_ids?:string[];rich_version?:number;reply_to?:string[];message_id?:string;references?:string;external_images?:string[];authentication?:Record<string,string>;direction?:MailDirection;loaded?:boolean;status?:string;archive_error?:string;attachment_error?:string;archive_id?:string}
export type InboxCursor={received?:string;sent?:string;receivedDone?:boolean;sentDone?:boolean;archiveOffset?:number;archiveDone?:boolean}
export type InboxContactState={user_id:string;contact:string;pinned_at:string|null;archived_at:string|null;read_at:string|null;marked_unread:boolean;notify_since:string|null;updated_at:string}
export type InboxPage={emails:InboxEmail[];cursor:string|null;hasMore:boolean;configured:boolean;canSend?:boolean;error?:string;next?:InboxCursor;contacts?:InboxContactState[];notificationEmail?:string}
export type ArchivedMailFile=InboxAttachment&{path:string;sha256:string}
export type SupportMailSnapshot={kind:'support_email';version:1;direction:MailDirection;email:InboxEmail;files:ArchivedMailFile[];idempotency_key?:string;headers?:Record<string,string>}
export const isSupportSnapshot=(value:unknown):value is SupportMailSnapshot=>Boolean(value&&typeof value==='object'&&'kind' in value&&value.kind==='support_email'&&'email' in value&&'files' in value)
export const mailbox=(value:string)=>(value.match(/<([^<>]+)>/)?.[1]||value).trim().toLowerCase()
export const messageKey=(email:Pick<InboxEmail,'id'|'direction'>)=>(email.direction||'inbound')+':'+email.id
export function contactForEmail(email:InboxEmail){return email.direction==='outbound'?mailbox(email.to.find(value=>mailbox(value)!=='support@koryx.ca')||email.to[0]||'support@koryx.ca'):mailbox(email.reply_to?.[0]||email.from)}
export function mergeEmails(...groups:InboxEmail[][]){
 const map=new Map<string,InboxEmail>(),archives=new Map<string,string>()
 for(const group of groups)for(const email of group){
  const key=messageKey(email),oldKey=email.archive_id?archives.get(email.archive_id):undefined,old=oldKey?map.get(oldKey):undefined
  if(old&&old.id!==old.archive_id&&email.id===email.archive_id)continue
  if(oldKey&&oldKey!==key)map.delete(oldKey)
  if(email.archive_id)archives.set(email.archive_id,key)
  map.set(key,{...map.get(key),...email})
 }
 return [...map.values()].sort((a,b)=>Date.parse(b.created_at)-Date.parse(a.created_at)||messageKey(a).localeCompare(messageKey(b)))
}
export const MAX_MAIL_FILES=10
export const MAX_MAIL_BYTES=4*1024*1024
export const isPreviewImage=(type:string)=>/^image\/(png|jpe?g|gif|webp|avif)$/i.test(type)
