import {createHash} from 'node:crypto'
export function versionOf(commit,files){return createHash('sha256').update(JSON.stringify({commit,files:files.map(({path,size,sha256,mime})=>({path,size,sha256,mime}))})).digest('hex')}
export function partsOf(files){const parts=[];let part=[],size=0;for(const file of files){const n=file.content_base64.length+1000;if(part.length&&size+n>500000){parts.push(part);part=[];size=0}part.push(file);size+=n}if(part.length)parts.push(part);return parts}
