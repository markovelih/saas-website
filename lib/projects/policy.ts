import {z} from 'zod'
import {countryCode} from './geography'
export const purchaseModeSchema=z.enum(['buyout','managed'])
export const materialIdsSchema=z.array(z.string().uuid()).max(10).refine(ids=>new Set(ids).size===ids.length).default([])
export const MAX_FILE_BYTES=3*1024*1024
export const MAX_MATERIAL_BYTES=20*1024*1024
export const MAX_SOURCE_BYTES=30*1024*1024
export function sourcePath(value:string){
 const path=value.replaceAll('\\','/')
 if(path.length>300||path.startsWith('/')||path.split('/').some(p=>!p||p==='.'||p==='..'||p.startsWith('.env')||/^(?:\.git|\.ssh|\.aws|node_modules|\.next|\.vercel|\.npmrc|\.netrc|credentials?(?:\..*)?|secrets?(?:\..*)?|service-account(?:\..*)?)$/i.test(p))||/[\x00-\x1f\x7f]/.test(path)||/\.(?:pem|key|p12|pfx|keystore|sqlite|db|tfstate|zip|tar|gz|7z)$/i.test(path))return null
 return path
}
export function sourceText(bytes:Uint8Array){
 const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes)
 const assignedCredential=/(?:["']?(?:password|passwd|client_secret|api[_-]?key|access[_-]?token|secret[_-]?key)["']?)\s*[:=]\s*["']([A-Za-z0-9_+\/!@#$%^&*().=:-]{12,})["']/i.exec(text)
 if((assignedCredential&&!/^(?:your|example|replace|placeholder|test[-_]|dummy|changeme)/i.test(assignedCredential[1]))||text.includes('\0')||/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:sk_live_|sk_test_|sk-proj-|ghp_|github_pat_|sb_secret_)[A-Za-z0-9_-]{16,}|AKIA[A-Z0-9]{16}|AIza[A-Za-z0-9_-]{35}|(?:postgres(?:ql)?|mysql):\/\/[^\s:]+:[^\s@]+@|eyJhbGciOi[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(text))throw new Error('Remove credentials from source files before handover.')
 return text
}
// Page paths are never collected: URLs and query strings can contain client data.
export const telemetrySchema=z.object({id:z.string().uuid(),kind:z.enum(['page_view','request']),status:z.number().int().min(100).max(599).optional(),country:z.string().max(2).optional().transform(countryCode),duration_ms:z.number().finite().min(0).max(120000).default(0)}).strict()
export function activityFromBuckets(buckets:{page_views:number;requests:number;errors:number;duration_ms:number}[]){const t=buckets.reduce((a,b)=>({pageViews:a.pageViews+b.page_views,requests:a.requests+b.requests,errors:a.errors+b.errors,duration:a.duration+b.duration_ms}),{pageViews:0,requests:0,errors:0,duration:0});return {...t,averageMs:t.requests?Math.round(t.duration/t.requests):null}}

export function sourceContent(bytes:Uint8Array){
 try{return {kind:'text' as const,text:sourceText(bytes),mime:'text/plain'}}catch(e){
  if(e instanceof Error&&e.message.includes('credentials'))throw e
  const image=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71?'image/png':bytes[0]===255&&bytes[1]===216&&bytes[2]===255?'image/jpeg':String.fromCharCode(...bytes.slice(0,6)).match(/^GIF8[79]a$/)?'image/gif':String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP'?'image/webp':'application/octet-stream'
  return {kind:'binary' as const,text:'',mime:image}
 }
}
