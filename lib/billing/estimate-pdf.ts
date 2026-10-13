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
 function block(v:string,x:number,top:number,width:number,size=10,strong=false){const rows=wrap(v,strong?bold:normal,size,width);rows.forEach((r,i)=>text(r,x,top+i*(size+5),size,strong));return rows.length*(size+5)}
 function right(v:string,top:number,strong=false){text(v,547-(strong?bold:normal).widthOfTextAtSize(v,10),top,10,strong)}
 function footer(){line(785);text('For information only - no payment is requested',48,799,8,false,muted);text('Page '+doc.getPageCount(),506,799,8,false,muted)}
 function room(height:number){if(y+height<=747)return false;footer();page=doc.addPage([595.28,841.89]);text('Estimate '+p.invoice_number,48,44,11,true);y=80;return true}
 page.drawSvgPath('M 0 36 L 36 0 L 50 0 L 0 50 Z M 17 34 L 29 46 L 43 46 L 24 27 Z',{x:440,y:795,scale:.55,color:ink});text('koryx',475,47,17,true)
 text('Project estimate',48,46,24,true)
 text(p.invoice_number+'  /  '+formatDate(p.issued_at),48,87,9,false,muted)
 y=130;y+=block(p.project.name,48,y,499,16,true)+14
 text(p.seller.seller_name,48,y,11,true);text('Prepared for',310,y,9,true)
 text(p.seller.support_email,48,y+22,9)
 const nameHeight=block(p.customer.name,310,y+22,237,10)
 const emailHeight=block(p.customer.email,310,y+22+nameHeight,237,9)
 y+=Math.max(55,22+nameHeight+emailHeight)+20
 const notice='Preliminary estimate only. This is not an invoice for payment and creates no payment obligation. Scope and final price will be agreed before work begins.'
 y+=block(notice,48,y,499,10)+24
 function header(){text('Service',48,y,9,false,muted);text('Qty',369,y,9,false,muted);text('CAD / unit',400,y,9,false,muted);text('Amount',494,y,9,false,muted);y+=23;line(y);y+=13}
 header()
 for(const item of p.items){
  const height=wrap(item.description,normal,10,300).length*15+(item.discount_amount?38:24)
  if(room(height+28))header()
  const top=y,descriptionHeight=block(item.description,48,top,300)
  text(String(item.quantity),370,top,10);text(formatAmount(item.unit_price),400,top,9);right(formatAmount(item.amount),top)
  if(item.discount_amount){text('Service discount'+(item.discount?.type==='percent'?' ('+item.discount.value+'%)':'')+': -'+formatAmount(item.discount_amount),48,top+descriptionHeight+3,9,false,muted);const original=formatAmount(item.gross_amount||item.quantity*item.unit_price),x=547-normal.widthOfTextAtSize(original,8);text(original,x,top+18,8,false,muted);page.drawLine({start:{x,y:841.89-top-23},end:{x:547,y:841.89-top-23},color:muted,thickness:.6})}
  y+=height;line(y-8)
 }
 const rows:[string,number][]=[['Subtotal',p.subtotal],...(p.service_discount_amount?[['Service discounts',-p.service_discount_amount] as [string,number]]:[]),...(p.order_discount_amount?[[`Order discount${p.discount?.type==='percent'?' ('+p.discount.value+'%)':''}`,-p.order_discount_amount] as [string,number]]:[])]
 room(rows.length*24+125);y+=12
 for(const [label,value] of rows){text(label,300,y,9);right(formatAmount(value),y);y+=24}
 if(p.discount_amount){const original=formatAmount(p.subtotal)+' CAD',x=547-normal.widthOfTextAtSize(original,10);text(original,x,y,10,false,muted);page.drawLine({start:{x,y:841.89-y-6},end:{x:547,y:841.89-y-6},color:muted,thickness:.7});y+=25}
 text('Estimated total',300,y,11,true);right(formatAmount(p.total)+' CAD',y,true);y+=50
 room(55);block('The services and discounts above are indicative. Reply to '+p.seller.support_email+' to discuss this estimate.',48,y,499,9)
 footer();return Buffer.from(await doc.save({useObjectStreams:false}))
}
