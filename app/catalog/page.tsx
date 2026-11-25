import Link from 'next/link'
import Image from 'next/image'
import {ArrowUpRight,ArrowRight} from 'lucide-react'
import {Navbar} from '@/components/vercel-home/navbar'
import {Footer} from '@/components/vercel-home/footer'
import {pageMetadata,publicSearchPages} from '@/lib/seo'
import {websiteConcepts} from '@/lib/templates/catalog'
import s from './catalog.module.css'

export const metadata=pageMetadata('/catalog',publicSearchPages['/catalog'])

export default function CatalogPage(){
  return <div className={s.page}><Navbar/><main className={s.main}>
    <nav className={s.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span aria-hidden="true">/</span><span>Catalog</span></nav>
    <header className={s.header}><div><p>KORYX / THE COLLECTION</p><h1>See what’s possible.</h1></div><p>Explore our website concepts. Open a design, try the details, and imagine what it could become for your business.</p></header>
    <section className={s.collection} aria-label="Website concepts">{websiteConcepts.map(concept=><Link href={concept.href} key={concept.slug} className={s.card} aria-label={'Explore '+concept.title+' — '+concept.category}><div className={s.preview}><Image src={concept.image} alt={concept.description} width={1200} height={675} sizes="(max-width: 600px) calc(100vw - 44px), (max-width: 1050px) 45vw, 410px" preload/><span className={s.open}><ArrowUpRight size={17}/><span className={s.srOnly}>Open preview</span></span></div><div className={s.caption}><h2>{concept.title}<span> / {concept.category}</span></h2><ArrowUpRight size={15}/></div></Link>)}</section>
    <div className={s.next}><p>Found a direction you like? We’ll make it your own.</p><Link href="/dashboard/new-order?type=website">Tell us about your project<ArrowRight size={15}/></Link></div>
  </main><Footer/></div>
}
