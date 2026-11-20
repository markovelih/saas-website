import {stageTitle} from '@/lib/payments/math'
import {PDFDocument,rgb,type PDFFont} from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import {readFile} from 'node:fs/promises'
import path from 'node:path'
import type {BillingSnapshot} from './types'
import {paymentMethods} from './types'
export const formatAmount=(n:number)=>new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD'}).format(n)
export const formatDate=(date:string)=>new Date(date).toLocaleDateString('en-CA',{year:'numeric',month:'long',day:'numeric',timeZone:'UTC'})
function lines(value:string,font:PDFFont,size:number,width:number){const result:string[]=[];for(const paragraph of value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g,'').split('\n')){let line='';for(const word of paragraph.split(/\s+/)){if(font.widthOfTextAtSize((line?line+' ':'')+word,size)>width){if(line)result.push(line);line='';for(const char of word){if(font.widthOfTextAtSize(line+char,size)>width){result.push(line);line=''}line+=char}}else line+=(line?' ':'')+word}result.push(line)}return result}
export async function billingPdf(snapshot:BillingSnapshot,kind:'invoice'|'receipt'){
 const doc=await PDFDocument.create();doc.registerFontkit(fontkit);doc.setTitle(`${snapshot.test?'TEST - ':''}Koryx ${kind} ${snapshot.invoice_number}`);doc.setAuthor('Koryx');doc.setCreationDate(new Date(snapshot.issued_at));doc.setModificationDate(new Date(snapshot.issued_at));
 const [regularBytes,boldBytes]=await Promise.all(['Regular','Bold'].map(weight=>readFile(path.join(process.cwd(),'lib/billing/fonts',`NotoSans-${weight}.ttf`))));
 const regular=await doc.embedFont(regularBytes,{subset:true});const bold=await doc.embedFont(boldBytes,{subset:true});
 let page=doc.addPage([595.28,841.89]);let y=0;const ink=rgb(.08,.08,.09),muted=rgb(.4,.4,.43),rule=rgb(.88,.88,.9);const W=499;
 function text(value:string,x:number,top:number,size=10,strong=false,color=ink){page.drawText(value,{x,y:841.89-top-size,size,font:strong?bold:regular,color})}
 function line(top:number){page.drawLine({start:{x:48,y:841.89-top},end:{x:547,y:841.89-top},thickness:.6,color:rule})}
 function block(value:string,x:number,top:number,width:number,size=10,strong=false){const rows=lines(value,strong?bold:regular,size,width);rows.forEach((row,i)=>text(row,x,top+i*(size+2),size,strong));return rows.length*(size+2)}
 function logo(){// Same geometric K mark as the site, drawn in black on a white invoice.
 page.drawSvgPath('M 0 36 L 36 0 L 50 0 L 0 50 Z M 17 34 L 29 46 L 43 46 L 24 27 Z',{x:440,y:795,scale:.55,color:ink});text('koryx',475,47,17,true)}
 function footer(){line(790);text('koryx.ca  •  '+snapshot.seller.support_email,48,804,8,false,muted);text(`Page ${doc.getPageCount()}`,505,804,8,false,muted)}
 function room(height:number){if(y+height>770){footer();page=doc.addPage([595.28,841.89]);text(`Koryx ${kind} · ${snapshot.invoice_number}`,48,44,11,true);y=68;return true}return false}
 logo();text(snapshot.test?'TEST '+(kind==='invoice'?'Invoice':'Receipt'):(kind==='invoice'?'Invoice':'Receipt'),48,46,23,true);
 const paid=snapshot.settled!==false;
 // Pair document numbers and dates to keep the header to two metadata rows.
 text('Invoice number',48,80,8.5,true);text(snapshot.invoice_number,152,80,8.5);
 if(kind==='receipt'){text('Receipt number',310,80,8.5,true);text(snapshot.receipt_number,410,80,8.5)}
 text('Date of issue',48,94,8.5,true);text(formatDate(snapshot.issued_at),152,94,8.5);
 text(paid?'Date paid':'Payment due',310,94,8.5,true);text(paid?formatDate(snapshot.paid_at):'On receipt',410,94,8.5);y=116;
 text(snapshot.seller.seller_name,48,y,10,true);text('Bill to',310,y,9.5,true);text(snapshot.seller.support_email,48,y+16,9.5);const customerHeight=block(snapshot.customer.name+'\n'+snapshot.customer.email+(snapshot.customer.address?'\n'+snapshot.customer.address:''),310,y+16,237,9.5);y+=Math.max(39,customerHeight+16)+6;
 text(paid?`${formatAmount(snapshot.total)} CAD paid on ${formatDate(snapshot.paid_at)}`:`${formatAmount(snapshot.total)} CAD due`,48,y,13,true);y+=20;if(snapshot.installment){text(stageTitle(snapshot.installment),48,y,9.5,true);y+=14}
 const paymentNote=kind==='invoice'?(paid?(snapshot.installment?stageTitle(snapshot.installment)+' received · This invoice is settled':'Paid in full · Amount due CAD $0.00'):(snapshot.installment?stageTitle(snapshot.installment)+' · Pay at koryx.ca/pay/'+snapshot.request_id:'Payment has not been recorded')):`Payment method: ${paymentMethods[snapshot.method]}`;
 const paymentNoteRows=lines(paymentNote,regular,8.5,W);paymentNoteRows.forEach((row,i)=>text(row,48,y+i*10.5,8.5,false,muted));y+=paymentNoteRows.length*10.5+8;
 const tableHead=()=>{text('Description',48,y,8.5,false,muted);text('Qty',370,y,8.5,false,muted);text('Unit price',400,y,8.5,false,muted);text('Amount',490,y,8.5,false,muted);y+=14;line(y);y+=6};tableHead();
 for(const item of snapshot.items){
  const descriptionHeight=lines(item.description,regular,9.5,300).length*11.5;
  const height=descriptionHeight+(item.discount_amount?10:0)+7;
  if(room(height))tableHead();
  const start=y;block(item.description,48,start,300,9.5);text(String(item.quantity),371,start,9.5);text(formatAmount(item.unit_price),400,start,9.5);
  const amount=formatAmount(item.amount);text(amount,547-regular.widthOfTextAtSize(amount,9.5),start,9.5);
  if(item.discount_amount){
   text('Service discount'+(item.discount?.type==='percent'?' ('+item.discount.value+'%)':'')+': -'+formatAmount(item.discount_amount),48,start+descriptionHeight,8.5,false,muted);
   const gross=formatAmount(item.gross_amount??item.quantity*item.unit_price),x=547-regular.widthOfTextAtSize(gross,8);
   text(gross,x,start+11.5,8,false,muted);page.drawLine({start:{x,y:841.89-start-15.5},end:{x:547,y:841.89-start-15.5},color:muted,thickness:.6});
  }
  y=start+height;line(y-3.5);
 }
 const totalRows:[string,string,boolean][]=[['Subtotal',formatAmount(snapshot.subtotal),false],...(snapshot.service_discount_amount?[["Service discounts",'-'+formatAmount(snapshot.service_discount_amount),false] as [string,string,boolean],...(snapshot.order_discount_amount?[[`Order discount${snapshot.discount?.type==='percent'?' ('+snapshot.discount.value+'%)':''}`,'-'+formatAmount(snapshot.order_discount_amount),false] as [string,string,boolean]]:[])]:snapshot.discount_amount?[[`Discount${snapshot.discount?.type==='percent'?' ('+snapshot.discount.value+'%)':''}`, '-'+formatAmount(snapshot.discount_amount),false] as [string,string,boolean]]:[]),[snapshot.installment?'Project total':'Total',formatAmount(snapshot.project_total??snapshot.total)+' CAD',true],...(snapshot.installment?[['Previously received',formatAmount(snapshot.previous_paid||0)+' CAD',false],['Remaining after payment',formatAmount(snapshot.remaining_balance||0)+' CAD',false]] as [string,string,boolean][]:[]),...(paid?[['Amount paid',formatAmount(snapshot.total)+' CAD',true]] as [string,string,boolean][]:[]),...(kind==='invoice'?[['Amount due',paid?'CAD $0.00':formatAmount(snapshot.total)+' CAD',true]] as [string,string,boolean][]:[])];
 const rowGap=14;room(totalRows.length*rowGap+5);y+=5;
 for(const [label,value,strong] of totalRows){text(label,300,y,9,strong);text(value,547-(strong?bold:regular).widthOfTextAtSize(value,9),y,9,strong);y+=rowGap}
 if(kind==='receipt'){
  const reference=snapshot.reference?'Payment reference: '+snapshot.reference:'';
  room(59+(snapshot.crypto_amount?14:0)+(reference?lines(reference,regular,9,W).length*11+4:0));
  y+=6;text('Payment history',48,y,12,true);y+=19;text('Payment method',48,y,8.5,false,muted);text('Date paid',220,y,8.5,false,muted);text('Amount paid',410,y,8.5,false,muted);y+=13;line(y);y+=5;
  text(paymentMethods[snapshot.method],48,y,9.5);text(formatDate(snapshot.paid_at),220,y,8.5);text(formatAmount(snapshot.total)+' CAD',410,y,9.5);y+=16;
  if(snapshot.crypto_amount){text('Cryptocurrency received: '+snapshot.crypto_amount+' '+(snapshot.method==='btc'?'BTC':'USDT'),48,y,9);y+=14}
  if(reference)y+=block(reference,48,y,W,9)+4;
 }
 if(snapshot.installment){const terms='50% to start; final 50% after client approval. Full upfront payment available. Voluntary cancellation: 50% of the agreed price is retained; if paid in full, the other 50% is refundable. Mandatory legal rights are preserved. koryx.ca/terms.';const height=lines(terms,regular,8,W).length*10+6;room(height);y+=6;y+=block(terms,48,y,W,8);}const notice=snapshot.test?'TEST DOCUMENT · No real payment was made.':`Questions about your ${kind}? Contact ${snapshot.seller.support_email}.`;room(lines(notice,regular,8,W).length*10+4);y+=4;block(notice,48,y,W,8);footer();return Buffer.from(await doc.save({useObjectStreams:false}));
}
