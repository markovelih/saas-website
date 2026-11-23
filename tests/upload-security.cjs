/* eslint-disable @typescript-eslint/no-require-imports -- Exercise real handlers with isolated dependencies. */
const assert=require('node:assert/strict'),sharp=require('sharp'),{deflateRawSync,crc32}=require('node:zlib'),load=require('./helpers/load-typescript.cjs')()
const {prepareMaterial}=load('lib/security/material-upload.ts'),{materialExtension}=load('lib/security/material-policy.ts'),{readBoundedBody,boundedFormData}=load('lib/security/request-body.ts')

// Harmless Office fixtures: real ZIP headers/checksums, no external files or network.
function office(extra=[],type='docx',contentType='<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"></Types>'){
 const entry=type==='docx'?'word/document.xml':type==='xlsx'?'xl/workbook.xml':'ppt/presentation.xml'
 const local=[],directory=[];let offset=0
 for(const [name,value] of [['[Content_Types].xml',contentType],[entry,'<document/>'],...extra]){
  const filename=Buffer.from(name),bytes=Buffer.from(value),packed=deflateRawSync(bytes),crc=crc32(bytes)
  const h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(8,8);h.writeUInt32LE(crc,14);h.writeUInt32LE(packed.length,18);h.writeUInt32LE(bytes.length,22);h.writeUInt16LE(filename.length,26)
  const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt16LE(8,10);c.writeUInt32LE(crc,16);c.writeUInt32LE(packed.length,20);c.writeUInt32LE(bytes.length,24);c.writeUInt16LE(filename.length,28);c.writeUInt32LE(offset,42)
  const piece=Buffer.concat([h,filename,packed]);local.push(piece);directory.push(c,filename);offset+=piece.length
 }
 const d=Buffer.concat(directory),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(local.length,8);end.writeUInt16LE(local.length,10);end.writeUInt32LE(d.length,12);end.writeUInt32LE(offset,16)
 return Buffer.concat([...local,d,end])
}

async function main(){
 for(const name of ['invoice.exe','invoice.EXE.pdf','image.jpg.php','file.php8.png','file.docm','archive.zip','../brief.txt','brief.txt:evil','a\u0000.jpg','a\u202eexe.pdf','file%00.jpg'])assert.equal(materialExtension(name),null,name)
 for(const name of ['Brief.pdf','Логотип.svg','notes.txt','plan.docx'])assert.ok(materialExtension(name),name)
 for(const [name,bytes] of [['invoice.pdf',Buffer.from('MZ harmless test')],['photo.png',Buffer.from('<svg onload="alert(1)"/>')],['photo.jpg',Buffer.from('not an image')],['file.docx',Buffer.from('PK fake')],['notes.txt',Buffer.from([0,1,2])],['data.json',Buffer.from('invalid json')]])await assert.rejects(()=>prepareMaterial(name,bytes),name)
 const original=await sharp({create:{width:2700,height:1200,channels:3,background:'#13579b'}}).jpeg().withMetadata().toBuffer()
 const image=await prepareMaterial('Reference.jpg',Buffer.concat([original,Buffer.from('<script>harmless trailing payload</script>')]))
 assert.equal(image.name,'Reference.webp');assert.equal(image.mime,'image/webp');const meta=await sharp(image.bytes).metadata();assert.equal(meta.width,2400);assert.equal(meta.exif,undefined);assert(!image.bytes.includes(Buffer.from('<script>')))
 await assert.rejects(()=>prepareMaterial('Mismatch.png',original))
 const huge=await sharp({create:{width:6000,height:6000,channels:3,background:'#000000'}}).png().toBuffer();await assert.rejects(()=>prepareMaterial('huge.png',huge))
 for(const ext of ['docx','xlsx','pptx'])assert.equal((await prepareMaterial('brief.'+ext,office([],ext))).mime,'application/octet-stream')
 for(const bytes of [office([['word/vbaProject.bin','not a real macro']]),office([['../outside.xml','harmless']]),office([['word/embeddings/item.bin','harmless']]),office([], 'docx','<Types>application/macroEnabled</Types>'),office([['word/bomb.xml','x'.repeat(41*1024*1024)]])])await assert.rejects(()=>prepareMaterial('brief.docx',bytes))
 const pdf=await prepareMaterial('brief.pdf',Buffer.from('%PDF-1.7\nharmless fixture\n%%EOF'));assert.equal(pdf.mime,'application/octet-stream')
 const svg=await prepareMaterial('Logo.svg',Buffer.from('<svg onload="alert(1)"></svg>'));assert.equal(svg.mime,'application/octet-stream','active SVG cannot receive an inline image MIME')
 function streamRequest(parts,headers={}){let index=0;return new Request('https://koryx.ca/upload',{method:'POST',duplex:'half',headers,body:new ReadableStream({pull(c){if(index===parts.length)c.close();else c.enqueue(Buffer.from(parts[index++]))}})})}
 assert.equal((await readBoundedBody(streamRequest(['ab','cd']),4)).toString(),'abcd')
 for(const headers of [{},{'content-length':'1'}])await assert.rejects(()=>readBoundedBody(streamRequest(['ab','cde'],headers),4),e=>e.status===413)
 await assert.rejects(()=>readBoundedBody(streamRequest(['abcd'],{'content-encoding':'gzip'}),4),e=>e.status===415)
 await assert.rejects(()=>readBoundedBody(new Request('https://koryx.ca/upload',{method:'POST',duplex:'half',body:new ReadableStream({start(){}})}),100,10),e=>e.status===408)
 const form=new FormData();form.set('file',new File(['hello'],'brief.txt',{type:'text/plain'}));form.set('text','Brief')
 const req=new Request('https://koryx.ca/upload',{method:'POST',body:form}),parsed=await boundedFormData(req,65536);assert.equal(await parsed.get('file').text(),'hello');assert.equal(parsed.get('text'),'Brief')
 await assert.rejects(()=>boundedFormData(new Request('https://koryx.ca/upload',{method:'POST',headers:{'content-type':'multipart/form-data; boundary=x'},body:'x'.repeat(100)}),50),e=>e.status===413)
 let authenticated=false,parseAttempted=false
 const send=require('./helpers/load-typescript.cjs')({'@/lib/supabase/admin':{founderClient:async()=>{if(!authenticated)throw Error('not founder')}},'@/lib/inbox/send':{sendSupportEmail:async()=>({success:true})},'@/lib/security/request-body':{boundedFormData:async()=>{parseAttempted=true;return form},BodyError:load('lib/security/request-body.ts').BodyError}})('app/api/inbox/send/route.ts')
 const mailReq=()=>new Request('https://koryx.ca/api/inbox/send',{method:'POST',headers:{origin:'https://koryx.ca'},body:'hello'})
 assert.equal((await send.POST(mailReq())).status,403);assert.equal(parseAttempted,false);authenticated=true;assert.equal((await send.POST(mailReq())).status,200);assert.equal(parseAttempted,true)
 console.log('PASS: upload formats/signatures, spoofing, double extensions, private SVG/doc downloads, image reconstruction/pixel limits, Office macros/traversal/bombs, actual streaming bounds/timeouts, multipart and authentication-before-parsing. Harmless offline fixtures only.')
}
main().catch(e=>{console.error(e);process.exitCode=1})
