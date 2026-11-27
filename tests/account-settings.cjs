const assert=require('node:assert/strict'),loader=require('./helpers/load-typescript.cjs')
const user={id:'owner-id',email:'ceo_artem@koryx.ca',email_confirmed_at:'2026-01-01'}
let authorized=true,allowed=true,otpUser=user.id,updates=[],verifications=[],mail=[],limits=0
const db={from:()=>({update(value){updates.push(value);return {eq:async(key,id)=>{assert.equal(id,user.id);return {error:null}}}}}),auth:{verifyOtp:async input=>{verifications.push(input);return {data:{user:{id:otpUser}},error:null}},updateUser:async input=>{updates.push(input);return {error:null}}}}
const admin={rpc:async()=>{limits++;return {data:allowed,error:null}},auth:{admin:{generateLink:async input=>{assert.deepEqual(input,{type:'recovery',email:user.email});return {data:{user,properties:{email_otp:'123456',hashed_token:'testhash'}},error:null}}}}}
const load=loader({'@/lib/workspace':{workspaceSession:async()=>{if(!authorized)throw Error('Unauthorized');return {user,supabase:db}}},'@supabase/supabase-js':{createClient:()=>admin},'next/cache':{revalidatePath:()=>{}},'@/lib/billing/mail':{sendMail:async job=>{mail.push(job);return {id:'mail-id'}}}})
process.env.SUPABASE_SERVICE_ROLE_KEY='mock-private-key';process.env.RESEND_API_KEY='mock-mail'
const actions=load('app/dashboard/settings/actions.ts')
;(async()=>{
 assert((await actions.saveProfile({first_name:'Artem',last_name:'Pasieka'})).success)
 assert.deepEqual(updates.pop(),{full_name:'Artem Pasieka'})
 assert((await actions.saveProfile({first_name:'X',last_name:'Y',email:'other@example.com',role:'admin'})).error);assert.equal(updates.length,0)
 assert((await actions.requestPasswordChange()).success);assert.equal(mail[0].to_address,user.email);assert.equal(updates.length,0,'Requesting a code must never change a password')
 const valid={code:'123456',password:'Longer-unique-password',confirmation:'Longer-unique-password'}
 assert((await actions.changePassword({...valid,confirmation:'different'})).error);assert.equal(verifications.length,0)
 assert((await actions.changePassword({...valid,email:'other@example.com'})).error)
 otpUser='another-user';assert((await actions.changePassword(valid)).error);assert.equal(updates.length,0)
 otpUser=user.id;allowed=false;const before=verifications.length;assert((await actions.changePassword(valid)).error);assert.equal(verifications.length,before)
 allowed=true;assert((await actions.changePassword(valid)).success);assert.deepEqual(updates.pop(),{password:valid.password})
 assert.equal(verifications.at(-1).email,user.email);assert.equal(verifications.at(-1).type,'recovery')
 authorized=false;await assert.rejects(()=>actions.requestPasswordChange(),/Unauthorized/);await assert.rejects(()=>actions.changePassword(valid),/Unauthorized/)
 console.log('Account settings: signed-in ownership, name-only updates, immutable email, verification-code binding, wrong-user rejection, password confirmation and throttling passed. No live account changed.')
})().catch(e=>{console.error(e);process.exitCode=1})
