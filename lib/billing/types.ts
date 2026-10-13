export type BillingItem = {description:string;quantity:number;unit_price:number;service_code?:string;discount?:Discount}
export type Discount={type:'amount'|'percent';value:number;high_approved?:boolean}
export type DocumentSelection='invoice'|'receipt'|'both'
export type ManagedDomain={id:string;order_id:string;user_id:string;hostname:string;status:'connected'|'pending'|'expired';renewal_date:string|null;cost_price:number;retail_price:number;notes:string;created_at:string}
export type PublicDomain=Omit<ManagedDomain,'cost_price'|'notes'>
export type Renewal={id:string;domain_id:string;order_id:string;user_id:string;due_date:string;amount:number;status:'due'|'submitted'|'paid'|'cancelled';payment_method:PaymentMethod|null;payment_reference:string|null;snapshot:BillingSnapshot|null;created_at:string;paid_at:string|null}
export type ProjectInvoice={fingerprint?:string;id:string;order_id:string;user_id:string;snapshot:BillingSnapshot;created_at:string}
export type Delivery = {
 website_url?: string; preview_path?: string; service_status?: 'active'|'maintenance'|'offline'|'not_launched';
 domain_status?: 'connected'|'pending'|'expired'; domain_renewal_date?: string|null;
 domain_renewal_price?: number|null; hosting_renewal_date?: string|null; hosting_renewal_price?: number|null;
 diagnostic_report?:string; updated_at?: string; notes?: string; bill_to_name?: string; bill_to_address?: string; billing_items?: BillingItem[];discount?:Discount;
}
export type BillingSettings = {id: boolean; seller_name: string; seller_address: string; support_email: string; tax_id: string; tax_label: string; tax_rate: number; from_email: string;usdt_address?:string;btc_address?:string}
export const defaultBilling: BillingSettings = {id:true,seller_name:'Koryx',seller_address:'',support_email:'support@koryx.ca',tax_id:'',tax_label:'Tax',tax_rate:0,from_email:'support@koryx.ca'}
export type PaymentMethod = 'usdt_trc20'|'btc'|'bank_transfer'|'cash'|'other'|'stripe'
export const paymentMethods: Record<PaymentMethod,string> = {stripe:'Card / Stripe',usdt_trc20:'USDT (TRC20)',btc:'Bitcoin (BTC)',bank_transfer:'Bank transfer',cash:'Cash',other:'Other / manual'}
export type BillingSnapshot = {version:1; installment?:'deposit'|'balance'|'full';project_total?:number;previous_paid?:number;remaining_balance?:number;request_id?:string;terms_version?:string; invoice_number:string; receipt_number:string; issued_at:string; paid_at:string; currency:'CAD'; seller:BillingSettings; customer:{name:string;email:string;address:string}; project:{id:string;name:string}; items:(BillingItem&{amount:number;gross_amount?:number;discount_amount?:number})[]; subtotal:number; tax:number; total:number; discount?:Discount;discount_amount?:number;service_discount_amount?:number;order_discount_amount?:number;settled?:boolean; method:PaymentMethod; reference:string; crypto_amount:string; test?:boolean}
export type Payment = {id:string;order_id:string;user_id:string;snapshot:BillingSnapshot;created_at:string;email_status:'pending'|'sending'|'sent'|'failed'|'uncertain';email_id:string|null;email_error:string|null;attempted_at:string|null}
