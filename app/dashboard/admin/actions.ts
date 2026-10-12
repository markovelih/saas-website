'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { OrderStatus } from '@/lib/supabase/types'

async function requireAdmin() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  if (user.email !== 'artpas01@gmail.com') redirect('/dashboard')

  return supabase
}

export async function updateOrder(formData: FormData) {
  const supabase = await requireAdmin()

  const id = String(formData.get('id'))
  const status = String(formData.get('status')) as OrderStatus
  const quoteRaw = String(formData.get('quote_price') || '')
  const adminNotes = String(formData.get('admin_notes') || '')
  const invoiceSent = formData.get('invoice_sent') === 'on'
  const paid = formData.get('paid') === 'on'

  const quote = quoteRaw.trim() === '' ? null : Number(quoteRaw)

  await supabase
    .from('orders')
    .update({
      status,
      quote_price: quote,
      invoice_sent: invoiceSent,
      paid,
      admin_notes: adminNotes,
    })
    .eq('id', id)

  revalidatePath('/dashboard/admin')
  revalidatePath('/dashboard/orders')
  revalidatePath('/dashboard')
}

export async function updateUserProfile(formData: FormData) {
  const supabase = await requireAdmin()

  const id = String(formData.get('id'))
  const fullName = String(formData.get('full_name') || '')
  const role = formData.get('role') === 'admin' ? 'admin' : 'user'

  await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      role,
    })
    .eq('id', id)

  revalidatePath('/dashboard/admin')
}
