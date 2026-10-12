import {timingSafeEqual} from 'node:crypto'
import {createClient} from '@supabase/supabase-js'
import type {Database} from '@/lib/supabase/types'
import {runReminders} from '@/lib/domains/reminders'
export const maxDuration=60
export async function GET(request:Request){const secret=process.env.CRON_SECRET,header=request.headers.get('authorization');if(!secret||!header)return new Response('Unauthorized',{status:401});const expected=Buffer.from('Bearer '+secret),actual=Buffer.from(header);if(actual.length!==expected.length||!timingSafeEqual(actual,expected))return new Response('Unauthorized',{status:401});const db=createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,{auth:{persistSession:false,autoRefreshToken:false}});try{return Response.json(await runReminders(db))}catch{return Response.json({error:'Reminder run failed.'},{status:500})}}
