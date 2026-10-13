'use client'

import {useRef,useState} from 'react'
import type {MouseEvent} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {ArrowRight,ArrowUpRight,Check,Minus,Plus,ShoppingBag,Package,Layers} from 'lucide-react'
import {Dialog,DialogContent,DialogDescription,DialogTitle} from '@/components/ui/dialog'
import {MotionSurface} from '@/components/motion/motion-primitives'
import s from './commerce-showcase.module.css'

const finishes=[{id:'ivory',name:'Warm ivory',price:189,label:'01',material:'Powder-coated aluminium'},{id:'graphite',name:'Soft graphite',price:199,label:'02',material:'Matte charcoal finish'},{id:'bronze',name:'Brushed bronze',price:219,label:'03',material:'Warm metallic finish'}] as const
type Finish=typeof finishes[number]['id']
type BagItem={finish:Finish;quantity:number}
const cad=(amount:number)=>new Intl.NumberFormat('en-CA',{style:'currency',currency:'CAD',maximumFractionDigits:0}).format(amount)

export function CommerceShowcase(){
 const bagTrigger=useRef<HTMLButtonElement>(null),bagInvoker=useRef<HTMLButtonElement|null>(null)
 const [finish,setFinish]=useState<Finish>('ivory'),[quantity,setQuantity]=useState(1),[bag,setBag]=useState<BagItem[]>([]),[bagOpen,setBagOpen]=useState(false),[added,setAdded]=useState(false)
 const selected=finishes.find(f=>f.id===finish)!
 const count=bag.reduce((sum,item)=>sum+item.quantity,0)
 const subtotal=bag.reduce((sum,item)=>sum+item.quantity*finishes.find(f=>f.id===item.finish)!.price,0)
 function openBag(event:MouseEvent<HTMLButtonElement>){bagInvoker.current=event.currentTarget;setBagOpen(true)}
 function choose(id:Finish){setFinish(id);setAdded(false)}
 function add(){setBag(old=>old.some(item=>item.finish===finish)?old.map(item=>item.finish===finish?{...item,quantity:item.quantity+quantity}:item):[...old,{finish,quantity}]);setAdded(true)}
 return <MotionSurface className={s.commerce} interactive label="Luma concept store: explore product finishes and a working demo bag">
  <header className={s.storeHeader}><span className={s.wordmark}>LUMA<span>ATELIER</span></span><span className={s.storeNav}>OBJECTS / LIGHT / EVERYDAY</span><button ref={bagTrigger} onClick={openBag} aria-label={`Open demo bag, ${count} items`}><ShoppingBag size={15}/><span>Bag</span><i>{String(count).padStart(2,'0')}</i></button></header>
  <div className={s.productLayout}>
   <div className={s.productVisual} data-finish={finish}><div className={s.visualTop}><span>THE EVERYDAY, RECONSIDERED.</span><span>FORM / 001</span></div><div className={s.lightAura}/><div className={s.lampWrap}><Image src="/showcase/luma-lamp-v1.webp" alt={`Sculptural portable table lamp, ${selected.name} visual concept`} width={900} height={1350} sizes="(max-width:650px) 90vw, 45vw" className={s.lamp}/></div><div className={s.floorShadow}/><div className={s.materialTag}><span>{selected.label} / MATERIAL STUDY</span><strong>{selected.material}</strong></div><span className={s.verticalLabel}>DESIGNED TO FEEL AT HOME.</span><div className={s.visualBottom}><span>PORTABLE / CONSIDERED / PERSONAL</span><span>DETAILS / CONSIDERED <ArrowUpRight size={10}/></span></div></div>
   <div className={s.productCopy}><div className={s.productLabel}><span>THE LUMA ONE</span><span className={s.edition}>CONCEPT COLLECTION</span></div><h3>A little light.<br/><em>A different<br/>atmosphere.</em></h3><p>For quiet corners and late ideas. A sculptural everyday object, with the details that make it yours.</p><div className={s.price}><strong>{cad(selected.price)}</strong><span>CAD / illustrative product price</span></div><div className={s.finishHeader}><span>Choose your finish</span><strong>{selected.name}</strong></div><div className={s.finishOptions}>{finishes.map(f=><button key={f.id} aria-label={`Preview ${f.name} finish`} aria-pressed={finish===f.id} onClick={()=>choose(f.id)}><i data-finish={f.id}/><span>{f.name}</span>{finish===f.id&&<Check size={11}/>}</button>)}</div><div className={s.purchase}><div className={s.quantity}><button aria-label="Decrease product quantity" disabled={quantity===1} onClick={()=>{setQuantity(q=>q-1);setAdded(false)}}><Minus size={12}/></button><output aria-label="Product quantity">{quantity}</output><button aria-label="Increase product quantity" disabled={quantity===10} onClick={()=>{setQuantity(q=>q+1);setAdded(false)}}><Plus size={12}/></button></div><button className={s.addButton} onClick={add}>{added?<Check size={14}/>:<ShoppingBag size={14}/>}<span>{added?'Added to your demo bag':'Add to demo bag'}</span><ArrowRight size={14}/></button></div><div className={s.feedback} role="status">{added?<><span>{quantity} × {selected.name} added.</span><button onClick={openBag}>View bag ({count}) <ArrowRight size={11}/></button></>:<span>Try a finish. Adjust the quantity. Explore the bag.</span>}</div><div className={s.productDetails}><span><Layers size={13}/> Considered materials</span><span><Package size={13}/> A complete purchase flow</span></div><small className={s.disclaimer}>Original store concept by Koryx. Sample product, finishes and prices; no sale or payment.</small></div>
  </div>
  <div className={s.businessRail}><div><span>01 / DISCOVERY</span><strong>A product worth a closer look.</strong></div><div><span>02 / THE DETAILS</span><strong>Choices that feel effortless.</strong></div><div><span>03 / YOUR BUSINESS</span><strong>A journey built around what you sell.</strong></div></div>
  <Dialog open={bagOpen} onOpenChange={setBagOpen}><DialogContent className={s.bagDialog} onCloseAutoFocus={event=>{event.preventDefault();(bagInvoker.current?.isConnected?bagInvoker.current:bagTrigger.current)?.focus()}}><span className={s.bagEyebrow}>LUMA / DEMO BAG</span><DialogTitle className={s.bagTitle}>The details, together.</DialogTitle><DialogDescription className={s.bagDescription}>Explore an example order summary. These are sample products; no purchase or payment is available.</DialogDescription><div className={s.bagItems}>{bag.length?bag.map(item=>{const variant=finishes.find(f=>f.id===item.finish)!;return <div key={item.finish}><i data-finish={item.finish}/><div><strong>Luma One</strong><span>{variant.name} · Qty {item.quantity}</span></div><strong>{cad(variant.price*item.quantity)}</strong></div>}):<p>Your demo bag is empty. Explore a finish and add the sample product.</p>}</div><div className={s.bagSubtotal}><span>Illustrative subtotal</span><strong>{cad(subtotal)} CAD</strong></div><div className={s.bagActions}><button onClick={()=>setBagOpen(false)}>Continue exploring <ArrowRight size={13}/></button>{bag.length>0&&<button onClick={()=>{setBag([]);setAdded(false)}}>Clear demo bag</button>}</div><Link href="/services/e-commerce" className={s.bagLink} onClick={()=>setBagOpen(false)}>Explore a store for your business <ArrowUpRight size={13}/></Link></DialogContent></Dialog>
 </MotionSurface>
}
