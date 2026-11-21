import {readdir,lstat,readFile,mkdir,writeFile,realpath} from 'node:fs/promises'
import {resolve,join,relative,sep} from 'node:path'
import {createHash} from 'node:crypto'
import {pathToFileURL} from 'node:url'
import {versionOf} from './protocol.mjs'
export {versionOf,partsOf} from './protocol.mjs'

const ignored=new Set(['.git','.next','.next-preview','.vercel','.koryx-source','node_modules','.DS_Store','.turbo','.cache','coverage','build','dist','out','.yarn','.pnp'])
export function safePath(path){return path.length<=300&&!path.startsWith('/')&&!/[\\\x00-\x1f\x7f]/.test(path)&&!path.split('/').some(p=>!p||p==='.'||p==='..'||p.toLowerCase().startsWith('.env')||ignored.has(p)||/^(?:\.ssh|\.aws|\.npmrc|\.netrc|credentials?(?:\..*)?|secrets?(?:\..*)?|service-account(?:\..*)?)$/i.test(p))&&!/\.(?:pem|key|p12|pfx|keystore|sqlite|db|tfstate|zip|tar|gz|7z)$/i.test(path)}
export function safeContent(bytes){
 let text;try{text=new TextDecoder('utf-8',{fatal:true}).decode(bytes)}catch{return}
 const assigned=Array.from(text.matchAll(/(?:["']?(?:password|passwd|client_secret|api[_-]?key|access[_-]?token|secret[_-]?key)["']?)\s*[:=]\s*["']([A-Za-z0-9_+\/!@#$%^&*().=:-]{12,})["']/gi))
 if((assigned.some(match=>!/^(?:your|example|replace|placeholder|test[-_]|dummy|changeme)/i.test(match[1])))||/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:sk_live_|sk_test_|sk-proj-|ghp_|github_pat_|sb_secret_)[A-Za-z0-9_-]{16,}|AKIA[A-Z0-9]{16}|AIza[A-Za-z0-9_-]{35}|(?:postgres(?:ql)?|mysql):\/\/[^\s:]+:[^\s@]+@|eyJhbGciOi[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/.test(text))throw Error('Possible credentials')
}
function mime(bytes){if(bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71)return 'image/png';if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';if(/^GIF8[79]a$/.test(bytes.subarray(0,6).toString()))return 'image/gif';if(bytes.subarray(0,4).toString()==='RIFF'&&bytes.subarray(8,12).toString()==='WEBP')return 'image/webp';try{const text=new TextDecoder('utf-8',{fatal:true}).decode(bytes);if(!text.includes('\0'))return 'text/plain'}catch{}return 'application/octet-stream'}
export async function buildSnapshot(root=process.cwd(),commit=process.env.VERCEL_GIT_COMMIT_SHA||null){
 root=await realpath(root);const files=[];let excluded=0,total=0
 async function walk(dir){for(const name of (await readdir(dir)).sort()){const full=join(dir,name),path=relative(root,full).split(sep).join('/');if(!safePath(path)){excluded++;continue}const stat=await lstat(full);if(stat.isSymbolicLink()){excluded++;continue}if(stat.isDirectory()){await walk(full);continue}if(!stat.isFile()){excluded++;continue}if(stat.size>3*1024*1024)throw Error('Source file exceeds 3 MB');const bytes=await readFile(full);try{safeContent(bytes)}catch{excluded++;continue}total+=bytes.length;if(total>30*1024*1024||files.length>=1000)throw Error('Source snapshot exceeds limits');files.push({path,size:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex'),mime:mime(bytes),content_base64:bytes.toString('base64')})}}
 await walk(root);files.sort((a,b)=>a.path<b.path?-1:a.path>b.path?1:0);if(!files.length)throw Error('No source files');if(commit!==null&&!/^[a-f0-9]{40}$/.test(commit))throw Error('Invalid source revision')
 return {protocol:1,commit,version:versionOf(commit,files),excluded_count:excluded,files}
}
export async function writeSnapshot(root=process.cwd()){
 const output=resolve(root,'.koryx-source');await mkdir(output,{recursive:true});let snapshot
 try{snapshot=await buildSnapshot(root);console.log(`Koryx Source: ${snapshot.files.length} files prepared; ${snapshot.excluded_count} excluded.`)}catch{snapshot={unavailable:true};console.warn('Koryx Source: packaging unavailable; website build continues. Previous Source remains available.')}
 await writeFile(join(output,'snapshot.json'),JSON.stringify(snapshot));return snapshot
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await writeSnapshot()
