import {z} from 'zod'
import {safeWebsite,billingItemsSchema,discountSchema} from '@/lib/billing/schema'
export const workRequestSchema=z.object({parent_id:z.string().uuid().nullable(),kind:z.enum(['addition','repair','diagnostic']),title:z.string().trim().min(2).max(150),brief:z.string().trim().min(10).max(10000),website_url:safeWebsite,request_id:z.string().uuid(),budget:z.number().int().min(25).max(100000).nullable().default(null)})
export const founderWorkSchema=workRequestSchema.extend({user_id:z.string().uuid(),items:billingItemsSchema.refine(items=>items.length>0,'Add at least one service.'),discount:discountSchema,private_notes:z.string().trim().max(10000).default('')})
