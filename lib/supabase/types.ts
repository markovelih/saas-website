import type {ChatThread,ChatMessage,ChatPage} from '@/lib/project-chat/types'
import type {PaymentRequest,Transaction,BillingState,CareService,CheckoutAttempt} from '@/lib/payments/types'
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
  parent_order_id?:string|null
  work_kind?:'project'|'addition'|'repair'|'diagnostic'
  work_origin?:'koryx'|'external'
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
      project_push_subscriptions: {Relationships: [];Row:{id:string;user_id:string;endpoint:string;p256dh:string;auth:string;language:string;created_at:string;updated_at:string};Insert:{user_id:string;endpoint:string;p256dh:string;auth:string;language:string;updated_at:string};Update:{language?:string;updated_at?:string}}
      project_push_outbox: {Relationships: [];Row:{id:string;message_id:string;order_id:string;user_id:string;created_at:string;attempts:number;next_attempt_at:string;lease_until:string|null;lease_token:string|null;sent_at:string|null;sent_subscriptions:string[]};Insert:never;Update:{sent_subscriptions?:string[];sent_at?:string;next_attempt_at?:string;lease_until?:string|null;lease_token?:string|null}}
      project_chat_threads: {Relationships: [];Row:{order_id:string;project_order_id:string|null;direct_client_id:string|null;developer_id:string|null;created_at:string;updated_at:string};Insert:{order_id:string;developer_id?:string|null};Update:{developer_id?:string|null;updated_at?:string}}
      project_chat_messages: {Relationships: [];Row:Omit<ChatMessage,'attachments'|'pending'|'failed'>;Insert:never;Update:never}
      project_chat_attachments: {Relationships: [];Row:{id:string;order_id:string;uploader_id:string;message_id:string|null;path:string;name:string;mime:string;size:number;created_at:string};Insert:{id:string;order_id:string;uploader_id:string;path:string;name:string;mime:string;size:number};Update:never}
      project_chat_preferences: {Relationships: [];Row:{order_id:string;user_id:string;pinned:boolean;last_read_at:string|null};Insert:never;Update:never}
      payment_requests: {Relationships: [];Row:PaymentRequest;Insert:Partial<PaymentRequest>;Update:Partial<PaymentRequest>}
      payment_transactions: {Relationships: [];Row:Transaction;Insert:Partial<Transaction>;Update:Partial<Transaction>}
      project_billing_state: {Relationships: [];Row:BillingState;Insert:Partial<BillingState>;Update:Partial<BillingState>}
      care_services: {Relationships: [];Row:CareService;Insert:Partial<CareService>;Update:Partial<CareService>}
      checkout_attempts: {Relationships: [];Row:CheckoutAttempt;Insert:Partial<CheckoutAttempt>;Update:Partial<CheckoutAttempt>}
      stripe_events: {Relationships: [];Row:{id:string;type:string;processed_at:string};Insert:{id:string;type:string};Update:never}
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
    Functions: {
      koryx_chat_start_direct:{Args:{p_client_id:string};Returns:ChatPage};
      koryx_chat_push_recipient:{Args:{p_order_id:string};Returns:{user_id:string;developer_id:string;direct:boolean}|null};
      koryx_chat_paid:{Args:{p_order_id:string};Returns:boolean};
      koryx_claim_chat_push:{Args:{p_order_id?:string};Returns:Database['public']['Tables']['project_push_outbox']['Row'][]};
      koryx_chat_access:{Args:{p_order_id:string;p_write?:boolean};Returns:boolean};
      koryx_chat_moderator:{Args:{p_order_id:string};Returns:boolean};
      koryx_assign_project_developer:{Args:{p_order_id:string;p_developer_id:string|null};Returns:undefined};
      koryx_chat_inbox:{Args:Record<string,never>;Returns:ChatThread[]};
      koryx_chat_page:{Args:{p_order_id:string;p_before?:string};Returns:ChatPage};
      koryx_chat_send:{Args:{p_order_id:string;p_id:string;p_body:string;p_reply_to?:string;p_attachments?:string[]};Returns:ChatMessage};
      koryx_chat_change:{Args:{p_order_id:string;p_id:string;p_action:string;p_body?:string};Returns:ChatMessage};
      koryx_chat_preference:{Args:{p_order_id:string;p_pinned?:boolean;p_read?:boolean};Returns:undefined};
koryx_settle_care:{Args:{p_care_id:string;p_snapshot:BillingSnapshot;p_stripe_id:string;p_due_date:string;p_next_date:string};Returns:Transaction};koryx_sync_refund:{Args:{p_stripe_id:string;p_refunded_cents:number};Returns:undefined};koryx_issue_installment:{Args:{p_order_id:string;p_kind:string;p_snapshot:BillingSnapshot};Returns:PaymentRequest};koryx_settle_installment:{Args:{p_request_id:string;p_snapshot:BillingSnapshot;p_source:string;p_stripe_id:string|null};Returns:Transaction};koryx_attach_preview:{Args:{p_order_id:string;p_path:string};Returns:undefined};koryx_save_domain:{Args:{p_order_id:string;p_domain:Record<string,unknown>};Returns:ManagedDomain};koryx_auth_email_limit:{Args:{p_key:string;p_limit:number;p_seconds:number};Returns:boolean};koryx_settle_renewal:{Args:{p_id:string;p_snapshot:BillingSnapshot;p_next_date:string|null};Returns:Renewal};koryx_record_payment: {Args: {p_order_id:string;p_snapshot:BillingSnapshot};Returns:Payment}}
    Enums: {
      order_status: OrderStatus
      user_role: UserRole
    }
  }
}
