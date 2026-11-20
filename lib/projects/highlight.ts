import Prism from 'prismjs'
import 'prismjs/components/prism-jsx'
import 'prismjs/components/prism-typescript'
import 'prismjs/components/prism-tsx'
import 'prismjs/components/prism-json'
import 'prismjs/components/prism-css'
import 'prismjs/components/prism-bash'
import 'prismjs/components/prism-python'
import 'prismjs/components/prism-sql'
import 'prismjs/components/prism-yaml'
import 'prismjs/components/prism-markdown'
export type CodePart={text:string;type:string}
const languages:Record<string,string>={js:'javascript',mjs:'javascript',cjs:'javascript',jsx:'jsx',ts:'typescript',tsx:'tsx',json:'json',css:'css',html:'markup',svg:'markup',xml:'markup',sh:'bash',bash:'bash',py:'python',sql:'sql',yml:'yaml',yaml:'yaml',md:'markdown',mdx:'markdown'}
export function highlightedLines(text:string,path:string):CodePart[][]{
 const language=languages[path.split('.').pop()?.toLowerCase()||''],grammar=Prism.languages[language],lines:CodePart[][]=[[]]
 function append(value:string|Prism.Token|Array<string|Prism.Token>,parent=''){
  if(Array.isArray(value)){for(const token of value)append(token,parent);return}
  if(typeof value!=='string'){append(value.content,value.type);return}
  const parts=value.split('\n');parts.forEach((part,i)=>{if(i)lines.push([]);if(part)lines[lines.length-1].push({text:part,type:parent})})
 }
 append(grammar?Prism.tokenize(text,grammar):text)
 return lines
}
