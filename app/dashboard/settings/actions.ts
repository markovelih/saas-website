'use server'
import {workspaceSession} from '@/lib/workspace'
import {createClient} from '@supabase/supabase-js'
import {z} from 'zod'
import {revalidatePath} from 'next/cache'
import {createHmac} from 'node:crypto'
import {sendMail} from '@/lib/billing/mail'
import {brandedEmail,escapeHtml} from '@/lib/billing/email'

const nameSchema=z.object({first_name:z.string().trim().min(1).max(50),last_name:z.string().trim().max(50)}).strict()
export async function saveProfile(raw:unknown){
 const parsed=nameSchema.safeParse(raw)
 if(!parsed.success)return {error:'Enter your first and last name (up to 50 characters each).'}
 const {supabase,user}=await workspaceSession()
 const full_name=[parsed.data.first_name,parsed.data.last_name].filter(Boolean).join(' ')
 const {error}=await supabase.from('profiles').update({full_name}).eq('id',user.id)
 if(error)return {error:'Your name could not be saved.'}
 revalidatePath('/dashboard','layout')
 return {success:true}
}
async function passwordLimit(userId:string,action:string,limit:number,seconds:number){
 const admin=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}})
 const key=createHmac('sha256',process.env.SUPABASE_SERVICE_ROLE_KEY!).update('account-password/'+action+'/'+userId).digest('hex')
 const {data,error}=await admin.rpc('koryx_auth_email_limit',{p_key:key,p_limit:limit,p_seconds:seconds})
 return {admin,allowed:!error&&Boolean(data)}
}
export async function requestPasswordChange(){
 const {user}=await workspaceSession()
 if(!user.email||!user.email_confirmed_at)return {error:'A verified sign-in email is required.'}
 if(!process.env.RESEND_API_KEY)return {error:'Verification email is temporarily unavailable.'}
 const {admin,allowed}=await passwordLimit(user.id,'request',3,900)
 if(!allowed)return {error:'Please wait before requesting another verification code.'}
 const {data,error}=await admin.auth.admin.generateLink({type:'recovery',email:user.email})
 if(error||data.user?.id!==user.id||!data.properties?.email_otp)return {error:'The verification code could not be created.'}
 const result=await sendMail({to_address:user.email,from_address:'support@koryx.ca',subject:'Confirm your Koryx password change',html:brandedEmail(`<h1>Change your Koryx password</h1><p>Enter this code in your account settings:</p><p style="font-size:32px;letter-spacing:5px;font-weight:bold">${escapeHtml(data.properties.email_otp)}</p><p>If you did not request this change, ignore this email. Your password has not changed.</p>`),snapshot:null,documents:'none'},'account-password/'+user.id+'/'+createHmac('sha256',process.env.SUPABASE_SERVICE_ROLE_KEY!).update(data.properties.hashed_token).digest('hex'))
 return result.error?{error:'The email request was not confirmed. Check your inbox before requesting another code.'}:{success:true}
}
export async function changePassword(raw:unknown){
 const parsed=z.object({code:z.string().trim().regex(/^\d{6,8}$/),password:z.string().min(8).max(128),confirmation:z.string()}).strict().refine(v=>v.password===v.confirmation).safeParse(raw)
 if(!parsed.success)return {error:'Enter the verification code and matching passwords of 8–128 characters.'}
 const {supabase,user}=await workspaceSession()
 if(!user.email||!user.email_confirmed_at)return {error:'A verified sign-in email is required.'}
 const {allowed}=await passwordLimit(user.id,'verify',8,900)
 if(!allowed)return {error:'Too many attempts. Please wait and request a new code.'}
 // Use the current user's immutable email, never a client-supplied address or user ID.
 const {data,error}=await supabase.auth.verifyOtp({email:user.email,token:parsed.data.code,type:'recovery'})
 if(error||data.user?.id!==user.id)return {error:'The code is invalid or expired. Request a new code.'}
 const result=await supabase.auth.updateUser({password:parsed.data.password})
 if(result.error)return {error:'The password could not be changed. Use a different strong password or request a new code.'}
 revalidatePath('/dashboard/settings')
 return {success:true}
}
