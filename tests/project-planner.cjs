// Run with: node tests/project-planner.cjs
const assert=require('node:assert/strict'),fs=require('node:fs'),ts=require('typescript'),vm=require('node:vm')
function load(file,imports={}){const exports={};const code=ts.transpileModule(fs.readFileSync(file,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(code,{exports,require:id=>imports[id]||(id==='server-only'?{}:require(id)),process,Buffer,Date,Set,JSON,Map},{filename:file});return exports}
const c=load('lib/project-planner/catalog.ts'),schema=load('lib/project-planner/schema.ts',{'./catalog':c})
const input={type:'website',budget:3000,pages:5,features:['dashboard'],brief:'A customer dashboard for a small studio.'}
assert.deepEqual(Array.from(c.normalizeFeatures('website',['dashboard','bogus','dashboard'])),['accounts','dashboard'])
assert.equal(c.buildEstimate(input).total,3200)
assert.equal(c.buildEstimate(input).withinBudget,false)
assert.equal(c.buildEstimate({...input,budget:500}).total,3200,'A low budget must not artificially cap the price')
assert.equal(c.buildEstimate({...input,features:['motion'],pages:7}).total,2300)
assert.equal(c.buildEstimate({...input,features:['motion']},'complex').total,2400)
assert.equal(c.buildEstimate({...input,type:'app',features:['accounts','dashboard']}).total,5000,'Included application features are not billed twice')
assert.equal(c.buildEstimate({...input,type:'store',features:['payments']}).total,3000,'Store checkout is included')
for(const budget of [500,1500,3000,5000,10000]){const features=c.budgetFeatures('website',budget,5);const result=c.buildEstimate({...input,budget,features});assert.ok(result.total<=budget||budget<1500)}
assert.equal(schema.plannerSchema.safeParse({...input,budget:-1}).success,false)
assert.equal(schema.plannerSchema.safeParse({...input,pages:1000}).success,false)
assert.equal(schema.plannerSchema.safeParse({...input,features:['invented']}).success,false)
assert.equal(schema.orderSchema.safeParse({...input,businessName:'Studio',contactEmail:'invalid',phone:'',references:'',deadline:'',designStyle:''}).success,false)
const old=process.env.SUPABASE_SERVICE_ROLE_KEY;process.env.SUPABASE_SERVICE_ROLE_KEY='unit-test-only-signing-value'
const sig=load('lib/project-planner/signature.ts'),estimate=c.buildEstimate(input),token=sig.signEstimate('owner',input,estimate)
assert.equal(sig.verifyEstimate(token,'owner',input).total,3200)
assert.equal(sig.verifyEstimate(token,'another-user',input),null)
assert.equal(sig.verifyEstimate(token,'owner',{...input,budget:5000}),null)
assert.equal(sig.verifyEstimate(token.replace(/.$/,'x'),'owner',input),null)
const [body,signature]=token.split('.');const tampered=JSON.parse(Buffer.from(body,'base64url'));tampered.estimate.total=1
assert.equal(sig.verifyEstimate(Buffer.from(JSON.stringify(tampered)).toString('base64url')+'.'+signature,'owner',input),null)
const snap=load('lib/project-planner/snapshot.ts'),snapshot=snap.serializePlan({input,estimate,brief:input.brief})
assert.equal(snap.readPlan(snapshot).estimate.total,3200)
assert.equal(snap.readPlan('Legacy project description'),null)
assert.equal(snap.readPlan('KORYX_PLAN_V1\ninvalid json'),null)
let inserted=null
const actions=load('app/dashboard/new-order/actions.ts',{
 '@/lib/supabase/server':{createClient:async()=>({auth:{getUser:async()=>({data:{user:{id:'owner'}}})},from:()=>({insert:value=>{inserted=value;return {select:()=>({single:async()=>({data:{id:'saved-project'},error:null})})}}})})},
 'next/cache':{revalidatePath:()=>{}},'@/lib/project-planner/schema':schema,'@/lib/project-planner/catalog':c,'@/lib/project-planner/signature':sig,'@/lib/project-planner/snapshot':snap,
})
;(async()=>{
 const details={businessName:'Test studio',contactEmail:'studio@example.test',phone:'',references:'',deadline:'',designStyle:'Dark & refined'}
 const result=await actions.createOrder({...input,...details,user_id:'forged-owner',status:'paid',quote_price:1,paid:true,admin_notes:'forged'})
 assert.equal(result.id,'saved-project')
 assert.equal(inserted.user_id,'owner','Project ownership must come from the authenticated session')
 for(const field of ['status','quote_price','paid','admin_notes'])assert.equal(field in inserted,false,'Client-supplied studio fields must not be persisted')
 assert.equal(snap.readPlan(inserted.description).estimate.total,3200)
 inserted=null
 const rejected=await actions.createOrder({...input,...details,estimateToken:token.replace(/.$/,'x')})
 assert.ok(rejected.error);assert.equal(inserted,null,'A modified AI estimate must not create a project')
 const accepted=await actions.createOrder({...input,...details,estimateToken:sig.signEstimate('owner',{...input,features:c.normalizeFeatures(input.type,input.features)},estimate)})
 assert.equal(accepted.id,'saved-project')
 console.log('Planner checks passed: prices, dependencies, budget fit, validation, signed estimate integrity, legacy briefs and authenticated order submission.')
})().catch(error=>{console.error(error);process.exitCode=1}).finally(()=>{if(old===undefined)delete process.env.SUPABASE_SERVICE_ROLE_KEY;else process.env.SUPABASE_SERVICE_ROLE_KEY=old})
