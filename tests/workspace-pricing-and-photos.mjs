import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import {createRequire} from 'node:module'
import ts from 'typescript'
import sharp from 'sharp'
const require=createRequire(import.meta.url)
async function sourceModule(path,imports={}){const source=await fs.readFile(new URL('../'+path,import.meta.url),'utf8');const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText;const module={exports:{}};new Function('require','module','exports',js)(id=>Object.hasOwn(imports,id)?imports[id]:require(id),module,module.exports);return module.exports}
const catalog=await sourceModule('lib/billing/service-catalog.ts')
const {domainRetail}=await sourceModule('lib/billing/pricing.ts',{'./service-catalog':catalog})
const {validateChatImage,firstName,CHAT_MAX_FILE_BYTES}=await sourceModule('lib/project-chat/policy.ts')
const {prepareChatPhoto}=await sourceModule('lib/project-chat/images.ts')
assert.equal(domainRetail(20),33);assert.equal(domainRetail(20,1.5),30);assert.equal(domainRetail(20,1.8),36)
for(const value of [0,0.01,10,12.49,19.99,100,1500])assert.ok(domainRetail(value)>=value*1.5&&domainRetail(value)<=value*1.8+.02)
for(const input of [-1,NaN,Infinity])assert.throws(()=>domainRetail(input));assert.throws(()=>domainRetail(20,1.49));assert.throws(()=>domainRetail(20,1.81))
assert.equal(firstName('  Artem PrivateSurname  '),'Artem');assert.equal(firstName('Олексій\tПрізвище'),'Олексій');assert.equal(firstName(null),'Developer')
assert.equal(validateChatImage({type:'image/png',size:200}),null);assert.ok(validateChatImage({type:'image/svg+xml',size:200}));assert.ok(validateChatImage({type:'image/png',size:CHAT_MAX_FILE_BYTES+1}))
const original=await sharp({create:{width:2600,height:1200,channels:3,background:'#65a6e3'}}).jpeg().withMetadata({orientation:1}).toBuffer()
assert.ok((await sharp(original).metadata()).exif)
const photo=await prepareChatPhoto(original),metadata=await sharp(photo).metadata();assert.equal(metadata.format,'webp');assert.equal(metadata.width,2000);assert.equal(metadata.height,923);assert.equal(metadata.exif,undefined)
await assert.rejects(()=>prepareChatPhoto(Buffer.from('not an image')))
await assert.rejects(()=>prepareChatPhoto(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><rect width="10" height="10"/></svg>')))
console.log('PASS: domain markup boundaries, first-name privacy, upload limits and photo sanitization')
