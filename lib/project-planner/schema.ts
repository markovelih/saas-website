import { z } from 'zod'
import { projectTypes, featureCatalog } from './catalog'
export const plannerSchema=z.object({
 type:z.enum(projectTypes.map(p=>p.id) as ['landing','website','store','app','feature']),
 budget:z.number().int().min(500).max(50000),pages:z.number().int().min(1).max(30),
 features:z.array(z.string().refine(id=>featureCatalog.some(f=>f.id===id))).max(10),
 brief:z.string().trim().min(20,'Describe your idea in at least 20 characters.').max(5000),
})
export const orderSchema=plannerSchema.extend({businessName:z.string().trim().min(2).max(120),contactEmail:z.string().trim().email().max(254),phone:z.string().max(40),references:z.string().max(2000),deadline:z.string().refine(s=>!s||/^\d{4}-\d{2}-\d{2}$/.test(s)),designStyle:z.string().max(120),domainTokens:z.array(z.string().max(3000)).max(5).default([]),estimateToken:z.string().max(20000).optional()})
