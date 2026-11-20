const fs=require('node:fs'),path=require('node:path'),ts=require('typescript')
module.exports=function loader(overrides={}){
 const cache=new Map()
 function load(file){
  file=path.resolve(file)
  if(cache.has(file))return cache.get(file)
  const m={exports:{}};cache.set(file,m.exports)
  const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText
  new Function('require','module','exports',code)(name=>Object.hasOwn(overrides,name)?overrides[name]:name==='server-only'?{}:name.startsWith('@/')?load(name.slice(2)+'.ts'):name.startsWith('.')?load(path.resolve(path.dirname(file),name)+'.ts'):require(name),m,m.exports)
  cache.set(file,m.exports);return m.exports
 }
 return load
}
