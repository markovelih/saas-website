import type {Metadata} from 'next'
import {NovaLanding} from '@/components/templates/nova/nova-landing'

export const metadata:Metadata={
  title:'NOVA — SaaS Website Concept | Koryx',
  description:'Explore NOVA: an interactive SaaS website concept with a particle hero, animated details and a monochrome design. Created by Koryx.',
  alternates:{canonical:'https://koryx.ca/templates/nova'},
  robots:{index:false,follow:true},
  openGraph:{title:'NOVA — A Koryx Website Concept',description:'A different kind of SaaS experience.',images:[{url:'/templates/nova/preview.webp',width:1200,height:675}]},
}
export default function NovaPage(){return <NovaLanding/>}
