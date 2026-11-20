'use client'
import {useEffect} from 'react'
import {usePathname} from 'next/navigation'
/** Mount once inside the project layout. Send after the site's analytics consent, if required. */
export function KoryxPageView({enabled=false}:{enabled?:boolean}){const path=usePathname();useEffect(()=>{if(!enabled||document.visibilityState!=='visible')return;const id=crypto.randomUUID();void fetch('/api/koryx-activity',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id}),keepalive:true}).catch(()=>{})},[enabled,path]);return null}
