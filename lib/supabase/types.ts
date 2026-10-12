import type {Delivery,BillingSettings,Payment,BillingSnapshot} from '@/lib/billing/types'
export type OrderStatus = 
  | 'pending'
  | 'in_review'
  | 'invoice_sent'
  | 'paid'
  | 'in_progress'
  | 'completed'

export type UserRole = 'user' | 'admin' | 'founder'

export type Profile = {
  id: string
  email: string
  full_name: string | null
  role: UserRole
  created_at: string
}

export type Order = {
  id: string
  user_id: string
  business_name: string
  website_type: string
  budget: string
  deadline: string | null
  pages: string | null
  design_style: string | null
  features: string[]
  description: string
  contact_email: string
  phone: string | null
  references: string | null
  status: OrderStatus
  quote_price: number | null
  invoice_sent: boolean
  paid: boolean
  admin_notes: string | null
  created_at: string
  delivery?: Delivery
  assignment_key?: string | null
}

export interface Database {
  public: {
    Tables: {
      billing_settings: {Relationships: []; Row: BillingSettings; Insert: BillingSettings; Update: Partial<BillingSettings>}
      project_payments: {Relationships: []; Row: Payment; Insert: Omit<Payment,'id'|'created_at'>; Update: Partial<Pick<Payment,'email_status'|'email_id'|'email_error'|'attempted_at'>>}
      profiles: {
        Relationships: []
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      orders: {
        Relationships: [{
          foreignKeyName: 'orders_user_id_fkey'
          columns: ['user_id']
          isOneToOne: false
          referencedRelation: 'profiles'
          referencedColumns: ['id']
        }]
        Row: Order
        Insert: Omit<Order, 'id' | 'created_at' | 'status' | 'quote_price' | 'invoice_sent' | 'paid' | 'admin_notes'> & {
          status?: OrderStatus
          quote_price?: number | null
          invoice_sent?: boolean
          paid?: boolean
          admin_notes?: string | null
        }
        Update: Partial<Omit<Order, 'id' | 'created_at' | 'user_id'>>
      }
    }
    Views: Record<string, never>
    Functions: {koryx_record_payment: {Args: {p_order_id:string;p_snapshot:BillingSnapshot};Returns:Payment}}
    Enums: {
      order_status: OrderStatus
      user_role: UserRole
    }
  }
}
