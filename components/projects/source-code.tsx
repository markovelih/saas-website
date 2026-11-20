'use client'
import {useMemo} from 'react'
import {highlightedLines} from '@/lib/projects/highlight'
import {useFounderLanguage} from '@/components/manager/language'
import s from './projects.module.css'
export function SourceCode({text,path,wrap=false}:{text:string;path:string;wrap?:boolean}){
 const {t}=useFounderLanguage(),lines=useMemo(()=>highlightedLines(text,path),[text,path])
 return <pre className={s.sourcePre} data-wrap={wrap} tabIndex={0} aria-label={t('Source code')}><code>{lines.map((parts,i)=><span className={s.codeLine} key={i}><em aria-hidden="true">{i+1}</em>{parts.length?parts.map((part,n)=><span key={n} className={part.type?'token '+part.type:undefined}>{part.text}</span>):'\u200b'}</span>)}</code></pre>
}
