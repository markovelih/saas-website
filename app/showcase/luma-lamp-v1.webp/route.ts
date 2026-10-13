import {lumaLampWebp} from '@/lib/showcase/luma-image'

export const dynamic='force-static'

export function GET(){
 return new Response(new Uint8Array(Buffer.from(lumaLampWebp,'base64')),{
  headers:{'Content-Type':'image/webp','Cache-Control':'public, max-age=31536000, immutable','X-Content-Type-Options':'nosniff'},
 })
}
