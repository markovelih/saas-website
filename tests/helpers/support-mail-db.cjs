const {randomUUID}=require('node:crypto')
module.exports=function mailDatabase(){
 const rows=[],contacts=[],threads=[],headers=[],objects=new Map(),events=[]
 let bucket=null
 const db={rows,contacts,threads,headers,objects,events,
  storage:{
   async getBucket(){return {data:bucket,error:bucket?null:{statusCode:'404'}}},
   async createBucket(id,options){events.push('create-private-bucket');if(options.public)throw Error('Mail bucket must be private');bucket={id,public:false};return {data:bucket,error:null}},
   from(id){if(id!=='support-mail')throw Error('Wrong bucket');return {
    async upload(path,bytes){events.push('upload');if(objects.has(path))return {data:null,error:{statusCode:'409',message:'Duplicate'}};objects.set(path,new Uint8Array(bytes));return {data:{path},error:null}},
    async download(path){events.push('download');return objects.has(path)?{data:new Blob([objects.get(path)]),error:null}:{data:null,error:{message:'Missing file'}}},
   }},
  },
  from(table){
   if(!['billing_mail','support_mail_index','support_inbox_contacts','support_inbox_threads','support_mail_headers'].includes(table))throw Error('Unexpected table: '+table)
   const records=table==='support_inbox_contacts'?contacts:table==='support_inbox_threads'?threads:table==='support_mail_headers'?headers:rows
   let action='read',input,options={},filters=[],sort=[],offset=0,count=Infinity,promise
   const q={select(){return q},insert(value){action='insert';input=value;return q},upsert(value,valueOptions){action='upsert';input=value;options=valueOptions;return q},update(value){action='update';input=value;return q},
    eq(key,value){filters.push(row=>row[key]===value);return q},
    not(key,operator,value){if(operator!=='is'||value!==null)throw Error('Unsupported test filter');filters.push(row=>row[key]!=null);return q},
    like(key,value){const prefix=value.replace(/%$/,'');filters.push(row=>String(row[key]).startsWith(prefix));return q},
    order(key,value){sort.push([key,value?.ascending!==false]);return q},
    range(start,end){offset=start;count=end-start+1;return q},limit(value){count=value;return q},
    single(){return run(true)},maybeSingle(){return run(true)},then(resolve,reject){return run(false).then(resolve,reject)}}
   function run(one){
    if(!promise)promise=Promise.resolve().then(()=>{
     let matches=records.filter(row=>filters.every(test=>test(row)))
     if(action==='insert'||action==='upsert'){
      const old=records.find(row=>table==='support_inbox_contacts'?row.user_id===input.user_id&&row.contact===input.contact:table==='support_inbox_threads'?row.user_id===input.user_id&&row.thread_key===input.thread_key:table==='support_mail_headers'?row.user_id===input.user_id&&row.email_key===input.email_key:row.dedupe_key===input.dedupe_key)
      if(old&&action==='insert')return {data:null,error:{code:'23505'}}
      if(old){if(!options.ignoreDuplicates)Object.assign(old,input);matches=[old]}
      else{const row={id:randomUUID(),created_at:new Date().toISOString(),...(['support_inbox_contacts','support_inbox_threads'].includes(table)?{pinned_at:null,archived_at:null,read_at:null,marked_unread:false,notify_since:null,updated_at:new Date().toISOString()}:{}),...input};records.push(row);matches=[row]}
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
