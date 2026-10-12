'use client'
import {useEffect,useRef,useState} from 'react'
import Script from 'next/script'
import {LockKeyhole,RotateCcw} from 'lucide-react'
type Embedded={mount:(element:HTMLElement)=>void;destroy:()=>void}
type StripeFactory=(key:string)=>{createEmbeddedCheckoutPage:(options:{clientSecret:string;onComplete:()=>void})=>Promise<Embedded>}
export function EmbeddedCheckout({clientSecret,publishableKey,returnPath}:{clientSecret:string;publishableKey:string;returnPath:string}){
 const mount=useRef<HTMLDivElement>(null),[ready,setReady]=useState(false),[error,setError]=useState(''),[retry,setRetry]=useState(0)
 useEffect(()=>{
  if(!ready||!mount.current)return
  let disposed=false,checkout:Embedded|undefined
  const factory=(window as unknown as {Stripe?:StripeFactory}).Stripe
  Promise.resolve().then(()=>{if(!factory)throw new Error('Stripe did not initialize');return factory(publishableKey).createEmbeddedCheckoutPage({clientSecret,onComplete:()=>window.location.assign(returnPath)})}).then(instance=>{if(disposed){instance.destroy();return}checkout=instance;if(mount.current)instance.mount(mount.current)}).catch(()=>{if(!disposed)setError('The secure payment form could not load. Retry or contact support@koryx.ca.')})
  return ()=>{disposed=true;checkout?.destroy()}
 },[clientSecret,publishableKey,ready,retry,returnPath])
 return <section className="mt-6 min-w-0" aria-label="Secure payment form">
  <Script id="koryx-stripe-checkout" src="https://js.stripe.com/endive/stripe.js" onReady={()=>setReady(true)} onError={()=>setError('Could not load secure checkout. Check your connection or browser blockers, then retry.')}/>
  <p className="text-xs text-white/50 flex items-center gap-2 mb-4"><LockKeyhole size={14}/>Pay here on Koryx. Your card details go directly to Stripe.</p>
  {!ready&&!error&&<p role="status" className="text-sm text-white/50 py-6">Loading secure payment form…</p>}
  {error?<div role="alert" className="border border-white/15 rounded-xl p-5"><p className="text-sm">{error}</p><button type="button" className="flex gap-2 items-center text-sm mt-4 underline" onClick={()=>{if(!ready){window.location.reload();return}setError('');setRetry(n=>n+1)}}><RotateCcw size={14}/>Retry</button></div>:<div className="bg-white rounded-2xl overflow-hidden min-w-0" ref={mount}/>}
  <p className="text-xs text-white/40 leading-relaxed mt-4">Enter your billing country, city, street address and postal code. Address suggestions are available in supported regions; you can always enter the address manually. Apple Pay appears when your device, browser and wallet support it. You can also enter your card details.</p>
 </section>
}
