import {PDFDocument,rgb,type PDFFont} from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import {readFile} from 'node:fs/promises'
import path from 'node:path'
import type {BillingSnapshot} from './types'
import {formatAmount,formatDate} from './pdf'

function wrap(value:string,font:PDFFont,size:number,width:number){
 const rows:string[]=[];let row=''
 for(const word of value.replace(/[\x00-\x1F]/g,' ').split(/\s+/)){
  if(font.widthOfTextAtSize((row?row+' ':'')+word,size)<=width){row+=(row?' ':'')+word;continue}
  if(row)rows.push(row);row=''
  for(const character of word){if(font.widthOfTextAtSize(row+character,size)>width){rows.push(row);row=''}row+=character}
 }
 rows.push(row);return rows
}
export async function estimatePdf(p:BillingSnapshot){
 const doc=await PDFDocument.create();doc.registerFontkit(fontkit)
 doc.setTitle('Koryx - Preliminary estimate '+p.invoice_number);doc.setAuthor('Koryx');doc.setCreationDate(new Date(p.issued_at));doc.setModificationDate(new Date(p.issued_at))
 const [normalBytes,boldBytes]=await Promise.all(['Regular','Bold'].map(w=>readFile(path.join(process.cwd(),'lib/billing/fonts',`NotoSans-${w}.ttf`))))
 const normal=await doc.embedFont(normalBytes,{subset:true}),bold=await doc.embedFont(boldBytes,{subset:true})
 const ink=rgb(.07,.07,.08),muted=rgb(.42,.42,.45),rule=rgb(.88,.88,.90)
 let page=doc.addPage([595.28,841.89]),y=0
 function text(v:string,x:number,top:number,size=10,strong=false,color=ink){page.drawText(v,{x,y:841.89-top-size,size,font:strong?bold:normal,color})}
 function line(top:number){page.drawLine({start:{x:48,y:841.89-top},end:{x:547,y:841.89-top},color:rule,thickness:.6})}
 function block(v:string,x:number,top:number,width:number,size=10,strong=false){const rows=wrap(v,strong?bold:normal,size,width);rows.forEach((r,i)=>text(r,x,top+i*(size+2),size,strong));return rows.length*(size+2)}
 function right(v:string,top:number,strong=false){text(v,547-(strong?bold:normal).widthOfTextAtSize(v,9.5),top,9.5,strong)}
 function footer(){line(785);text('For information only - no payment is requested',48,799,8,false,muted);text('Page '+doc.getPageCount(),506,799,8,false,muted)}
 function room(height:number){if(y+height<=765)return false;footer();page=doc.addPage([595.28,841.89]);text('Estimate '+p.invoice_number,48,44,11,true);y=68;return true}
 page.drawSvgPath('M 0 36 L 36 0 L 50 0 L 0 50 Z M 17 34 L 29 46 L 43 46 L 24 27 Z',{x:440,y:795,scale:.55,color:ink});text('koryx',475,47,17,true)
 text('Project estimate',48,46,23,true)
 text(p.invoice_number+'  /  '+formatDate(p.issued_at),48,80,8.5,false,muted)
 y=103;y+=block(p.project.name,48,y,499,14,true)+8
 text(p.seller.seller_name,48,y,10,true);text('Prepared for',310,y,9,true)
 text(p.seller.support_email,48,y+16,9)
 const nameHeight=block(p.customer.name,310,y+16,237,9.5)
 const emailHeight=block(p.customer.email,310,y+16+nameHeight,237,9)
 y+=Math.max(39,16+nameHeight+emailHeight)+8
 const notice='Preliminary estimate only. This is not an invoice for payment and creates no payment obligation. Scope and final price will be agreed before work begins.'
 y+=block(notice,48,y,499,9.5)+10
 function header(){text('Service',48,y,8.5,false,muted);text('Qty',369,y,8.5,false,muted);text('CAD / unit',400,y,8.5,false,muted);text('Amount',494,y,8.5,false,muted);y+=14;line(y);y+=6}
 header()
 for(const item of p.items){
  const height=wrap(item.description,normal,9.5,300).length*11.5+(item.discount_amount?10:0)+7
  if(room(height))header()
  const top=y,descriptionHeight=block(item.description,48,top,300,9.5)
  text(String(item.quantity),370,top,9.5);text(formatAmount(item.unit_price),400,top,9);right(formatAmount(item.amount),top)
  if(item.discount_amount){text('Service discount'+(item.discount?.type==='percent'?' ('+item.discount.value+'%)':'')+': -'+formatAmount(item.discount_amount),48,top+descriptionHeight,8.5,false,muted);const original=formatAmount(item.gross_amount||item.quantity*item.unit_price),x=547-normal.widthOfTextAtSize(original,8);text(original,x,top+11.5,8,false,muted);page.drawLine({start:{x,y:841.89-top-16.5},end:{x:547,y:841.89-top-16.5},color:muted,thickness:.6})}
  y+=height;line(y-3.5)
 }
 const rows:[string,number][]=[['Subtotal',p.subtotal],...(p.service_discount_amount?[['Service discounts',-p.service_discount_amount] as [string,number]]:[]),...(p.order_discount_amount?[[`Order discount${p.discount?.type==='percent'?' ('+p.discount.value+'%)':''}`,-p.order_discount_amount] as [string,number]]:[])]
 const closing='The services and discounts above are indicative. Reply to '+p.seller.support_email+' to discuss this estimate.'
 room(5+rows.length*14+25+wrap(closing,normal,9,499).length*11);y+=5
 for(const [label,value] of rows){text(label,300,y,9);right(formatAmount(value),y);y+=14}
 text('Estimated total',300,y,10,true);right(formatAmount(p.total)+' CAD',y,true);y+=25
 block(closing,48,y,499,9)
 footer();return Buffer.from(await doc.save({useObjectStreams:false}))
}
