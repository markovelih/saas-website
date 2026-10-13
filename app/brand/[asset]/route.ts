import {readFile} from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

export const dynamic = 'force-static'
export const dynamicParams = false

const assets = ['favicon.png','favicon.ico','apple-touch-icon.png']
export function generateStaticParams() {
  return assets.map(asset => ({asset}))
}

async function createIco(logo:Buffer) {
  const sizes = [16,32,48,96]
  const images = await Promise.all(sizes.map(size => sharp(logo).resize(size,size).png().toBuffer()))
  const header = Buffer.alloc(6 + images.length * 16)
  header.writeUInt16LE(1,2)
  header.writeUInt16LE(images.length,4)
  let offset = header.length
  images.forEach((image,index) => {
    const entry = 6 + index * 16
    header[entry] = sizes[index]
    header[entry + 1] = sizes[index]
    header.writeUInt16LE(1,entry + 4)
    header.writeUInt16LE(32,entry + 6)
    header.writeUInt32LE(image.length,entry + 8)
    header.writeUInt32LE(offset,entry + 12)
    offset += image.length
  })
  return Buffer.concat([header,...images])
}

// Generated at build time from the existing logo, with stable, public URLs.
export async function GET(_request:Request,{params}:{params:Promise<{asset:string}>}) {
  const {asset} = await params
  if (!assets.includes(asset)) return new Response(null,{status:404})
  const logo = await readFile(path.join(process.cwd(),'public/icon.svg'))
  const ico = asset === 'favicon.ico'
  const size = asset === 'apple-touch-icon.png' ? 180 : 96
  const bytes = ico ? await createIco(logo) : await sharp(logo).resize(size,size).png().toBuffer()
  return new Response(new Uint8Array(bytes),{
    headers:{
      'Content-Type':ico ? 'image/x-icon' : 'image/png',
      'Cache-Control':'public, max-age=86400, must-revalidate',
      'X-Content-Type-Options':'nosniff',
    },
  })
}
