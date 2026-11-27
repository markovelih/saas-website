import 'server-only'
import sanitizeHtml from 'sanitize-html'
import {isPreviewImage,type InboxEmail} from './types'

const safeUrl=(value:string)=>{try{const url=new URL(value);return ['https:','http:','mailto:'].includes(url.protocol)&&!url.username&&!url.password?url.toString():''}catch{return ''}}
const tags=['p','div','span','br','strong','b','em','i','u','s','strike','del','a','ul','ol','li','blockquote','pre','code','h1','h2','h3','h4','hr','table','thead','tbody','tfoot','tr','th','td','img','font','sub','sup']
export const contentId=(value:string)=>value.replace(/^cid:/i,'').replace(/^<|>$/g,'').trim()
function lowContrast(color:string){
 const value=color.trim().toLowerCase();if(value==='black')return true
 const hex=value.match(/^#([a-f0-9]{3}|[a-f0-9]{6})$/),rgb=value.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/)
 const channels=hex?(hex[1].length===3?[...hex[1]].map(x=>parseInt(x+x,16)):hex[1].match(/../g)!.map(x=>parseInt(x,16))):rgb?rgb.slice(1).map(Number):null
 return Boolean(channels&&channels.reduce((sum,v,i)=>sum+[.2126,.7152,.0722][i]*Math.pow(v/255,2.2),0)<.12)
}
// Store a restricted HTML fragment, never scripts, forms, CSS resources or provider-signed URLs.
export function cleanMailHtml(value:unknown){
 if(typeof value!=='string')return ''
 return sanitizeHtml(value.slice(0,500000),{
  allowedTags:tags,
  allowedAttributes:{'*':['style','dir'],a:['href','title','target','rel'],img:['src','alt','width','height'],font:['face','color','size'],td:['colspan','rowspan'],th:['colspan','rowspan']},
  allowedSchemes:['https','http','mailto','cid'],allowProtocolRelative:false,
  allowedStyles:{'*':{'font-weight':[/^(normal|bold|bolder|[1-9]00)$/],'font-style':[/^(normal|italic)$/],'text-decoration':[/^(none|underline|line-through)( (underline|line-through))?$/],'text-align':[/^(left|right|center|justify)$/],'font-family':[/^[a-zA-Z0-9 ,"'-]{1,100}$/],'font-size':[/^\d{1,2}(px|pt)$/],color:[/^#[a-fA-F0-9]{3,8}$/,/^rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)$/,/^(black|white|red|green|blue|gray|grey)$/]}},
  transformTags:{a:(_tag,attributes)=>({tagName:'a',attribs:{...attributes,href:safeUrl(attributes.href||''),target:'_blank',rel:'noopener noreferrer'}}),img:(_tag,attributes)=>({tagName:'img',attribs:{...attributes,src:/^cid:/i.test(attributes.src||'')?attributes.src:safeUrl(attributes.src||'').replace(/^mailto:.*$/,'')}})},
  nonTextTags:['script','style','textarea','option','noscript'],
 })
}
export function mailBody(email:InboxEmail,external=false){
 const used=new Set<string>()
 const html=sanitizeHtml(cleanMailHtml(email.html),{
  allowedTags:tags,allowedAttributes:false,allowedSchemes:['https','http','mailto'],allowProtocolRelative:false,
  transformTags:{'*':(tagName,a)=>{
   if(a.style)a.style=a.style.replace(/(^|;)\s*color:([^;]+)/gi,(all,separator,color)=>lowContrast(color)?separator:all)
   if(a.color&&lowContrast(a.color))delete a.color
   return {tagName,attribs:a}
  },img:(_tag,a):sanitizeHtml.Tag=>{
   const file=/^cid:/i.test(a.src||'')?email.attachments.find(file=>file.content_id&&contentId(file.content_id)===contentId(a.src)&&isPreviewImage(file.content_type)):undefined
   if(file){used.add(file.id);return {tagName:'img',attribs:{src:`/api/inbox/${email.id}/attachments/${file.id}?preview=1&direction=${email.direction||'inbound'}&account=${email.mail_account||'support'}`,alt:a.alt||file.filename,loading:'lazy'}}}
   if(external&&/^https:\/\//i.test(a.src||''))return {tagName:'img',attribs:{src:a.src,alt:a.alt||'Email image',referrerpolicy:'no-referrer',loading:'lazy'}}
   return {tagName:'span',attribs:{},text:a.alt?'['+a.alt+']':''}
  }},
 })
 return {html,inlineIds:[...used]}
}
