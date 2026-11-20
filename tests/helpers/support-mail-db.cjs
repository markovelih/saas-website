const {randomUUID}=require('node:crypto')
module.exports=function mailDatabase(){
 const rows=[],objects=new Map(),events=[]
 let bucket=null
 const db={rows,objects,events,
  storage:{
   async getBucket(){return {data:bucket,error:bucket?null:{statusCode:'404'}}},
   async createBucket(id,options){events.push('create-private-bucket');if(options.public)throw Error('Mail bucket must be private');bucket={id,public:false};return {data:bucket,error:null}},
   from(id){if(id!=='support-mail')throw Error('Wrong bucket');return {
    async upload(path,bytes){events.push('upload');if(objects.has(path))return {data:null,error:{statusCode:'409',message:'Duplicate'}};objects.set(path,new Uint8Array(bytes));return {data:{path},error:null}},
    async download(path){events.push('download');return objects.has(path)?{data:new Blob([objects.get(path)]),error:null}:{data:null,error:{message:'Missing file'}}},
   }},
  },
  from(table){
   if(table!=='billing_mail')throw Error('Unexpected table: '+table)
   let action='read',input,options={},filters=[],sort=[],offset=0,count=Infinity,promise
   const q={select(){return q},insert(value){action='insert';input=value;return q},upsert(value,valueOptions){action='upsert';input=value;options=valueOptions;return q},update(value){action='update';input=value;return q},
    eq(key,value){filters.push(row=>row[key]===value);return q},
    like(key,value){const prefix=value.replace(/%$/,'');filters.push(row=>String(row[key]).startsWith(prefix));return q},
    order(key,value){sort.push([key,value?.ascending!==false]);return q},
    range(start,end){offset=start;count=end-start+1;return q},limit(value){count=value;return q},
    single(){return run(true)},maybeSingle(){return run(true)},then(resolve,reject){return run(false).then(resolve,reject)}}
   function run(one){
    if(!promise)promise=Promise.resolve().then(()=>{
     let matches=rows.filter(row=>filters.every(test=>test(row)))
     if(action==='insert'||action==='upsert'){
      const old=rows.find(row=>row.dedupe_key===input.dedupe_key)
      if(old&&action==='insert')return {data:null,error:{code:'23505'}}
      if(old){if(!options.ignoreDuplicates)Object.assign(old,input);matches=[old]}
      else{const row={id:randomUUID(),created_at:new Date().toISOString(),...input};rows.push(row);matches=[row]}
      events.push('save-mail')
     }
     if(action==='update'){matches.forEach(row=>Object.assign(row,input));events.push('update-mail')}
     for(const [key,ascending] of sort.reverse())matches.sort((a,b)=>(String(a[key]).localeCompare(String(b[key])))*(ascending?1:-1))
     matches=matches.slice(offset,offset+count)
     return {data:one?(matches[0]||null):matches,error:null}
    })
    return promise
   }
   return q
  }}
 return db
}
