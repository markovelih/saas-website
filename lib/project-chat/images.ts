import sharp from 'sharp'
// Decode and re-encode every upload: no original EXIF, scripts or external assets are retained.
export async function prepareChatPhoto(bytes:Buffer){
 const image=sharp(bytes,{limitInputPixels:40000000,animated:false})
 const metadata=await image.metadata()
 if(!metadata.format||!['jpeg','png','webp'].includes(metadata.format))throw new Error('Unsupported photo format.')
 return image.rotate().resize(2000,2000,{fit:'inside',withoutEnlargement:true}).webp({quality:88}).toBuffer()
}
