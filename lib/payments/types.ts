import type {BillingSnapshot} from '@/lib/billing/types'
export type Installment='deposit'|'balance'|'full'
export type PaymentRequest={id:string;order_id:string;user_id:string;kind:Installment;amount_cents:number;contract_cents:number;status:'open'|'paid'|'void';snapshot:BillingSnapshot;created_at:string}
export type Transaction={id:string;request_id:string|null;order_id:string;user_id:string;care_id:string|null;amount_cents:number;refunded_cents:number;stripe_payment_id:string|null;source:'stripe'|'manual';snapshot:BillingSnapshot;created_at:string}
export type BillingState={order_id:string;user_id:string;review_ready:boolean;approved_at:string|null;terms_version:string|null;accepted_at:string|null;cancelled_at:string|null}
export type CareService={id:string;order_id:string;user_id:string;domain_id:string|null;name:string;kind:'domain'|'hosting';amount_cents:number;interval:'month'|'year';next_date:string;subscription_id:string|null;customer_id:string|null;status:'inactive'|'active'|'past_due'|'cancelled';cancel_at_period_end:boolean;consented_at:string|null;created_at:string}
export type CheckoutAttempt={id:string;request_id:string|null;care_id:string|null;order_id:string;user_id:string;session_id:string|null;session_url:string|null;expires_at:string|null;status:'creating'|'open'|'completed'|'expired';amount_cents:number;snapshot:BillingSnapshot|null;created_at:string}
