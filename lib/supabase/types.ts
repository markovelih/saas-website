import type {MailJob} from '@/lib/billing/mail'
import type {Delivery,BillingSettings,Payment,BillingSnapshot,ManagedDomain,Renewal,ProjectInvoice} from '@/lib/billing/types'
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
      order_domains: {Relationships: [];Row:ManagedDomain;Insert:Omit<ManagedDomain,'id'|'created_at'>;Update:Partial<ManagedDomain>}
      domain_renewals: {Relationships: [];Row:Renewal;Insert:Omit<Renewal,'id'|'created_at'>;Update:Partial<Renewal>}
      project_invoices: {Relationships: [];Row:ProjectInvoice;Insert:Omit<ProjectInvoice,'id'|'created_at'>;Update:Partial<ProjectInvoice>}
      billing_mail: {Relationships: [];Row:MailJob;Insert:Omit<MailJob,'id'|'created_at'>;Update:Partial<MailJob>}
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
    Functions: {koryx_attach_preview:{Args:{p_order_id:string;p_path:string};Returns:undefined};koryx_save_domain:{Args:{p_order_id:string;p_domain:Record<string,unknown>};Returns:ManagedDomain};koryx_auth_email_limit:{Args:{p_key:string;p_limit:number;p_seconds:number};Returns:boolean};koryx_settle_renewal:{Args:{p_id:string;p_snapshot:BillingSnapshot;p_next_date:string|null};Returns:Renewal};koryx_record_payment: {Args: {p_order_id:string;p_snapshot:BillingSnapshot};Returns:Payment}}
    Enums: {
      order_status: OrderStatus
      user_role: UserRole
    }
  }
}
