import type {UIMessage} from 'ai'
import {z} from 'zod'
export type AssistantMessage={role:'user'|'assistant';content:string}
export const assistantRequest=z.object({messages:z.array(z.object({role:z.enum(['user','assistant']),content:z.string().trim().min(1).max(5000)}).strict()).min(1).max(10)}).strict().refine(value=>value.messages.at(-1)?.role==='user'&&value.messages.reduce((size,m)=>size+m.content.length,0)<=14000)
export function messageText(message:Pick<UIMessage,'parts'>){return message.parts.filter(part=>part.type==='text').map(part=>part.text).join('')}
export function conversationContext(messages:UIMessage[]):AssistantMessage[]{
 const selected:AssistantMessage[]=[]
 let size=0
 for(const message of messages.slice(-10).reverse()){
  if(message.role!=='user'&&message.role!=='assistant')continue
  const content=messageText(message).trim().slice(0,5000)
  if(!content)continue
  if(size+content.length>14000)break
  selected.unshift({role:message.role,content});size+=content.length
 }
 while(selected[0]?.role==='assistant')selected.shift()
 return selected
}
export function conversationText(messages:UIMessage[]){return messages.map(message=>`${message.role==='user'?'You':'Koryx AI'}: ${messageText(message)}`).join('\n\n')}
