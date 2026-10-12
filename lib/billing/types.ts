export type BillingItem = {description:string;quantity:number;unit_price:number}
export type Delivery = {
 website_url?: string; preview_path?: string; service_status?: 'active'|'maintenance'|'offline'|'not_launched';
 domain_status?: 'connected'|'pending'|'expired'; domain_renewal_date?: string|null;
 domain_renewal_price?: number|null; hosting_renewal_date?: string|null; hosting_renewal_price?: number|null;
 updated_at?: string; notes?: string; bill_to_name?: string; bill_to_address?: string; billing_items?: BillingItem[];
}
export type BillingSettings = {id: boolean; seller_name: string; seller_address: string; support_email: string; tax_id: string; tax_label: string; tax_rate: number; from_email: string}
export const defaultBilling: BillingSettings = {id:true,seller_name:'Koryx',seller_address:'',support_email:'support@koryx.ca',tax_id:'',tax_label:'Tax',tax_rate:0,from_email:'support@koryx.ca'}
export type PaymentMethod = 'usdt_trc20'|'btc'|'bank_transfer'|'cash'|'other'
export const paymentMethods: Record<PaymentMethod,string> = {usdt_trc20:'USDT (TRC20)',btc:'Bitcoin (BTC)',bank_transfer:'Bank transfer',cash:'Cash',other:'Other / manual'}
export type BillingSnapshot = {version:1; invoice_number:string; receipt_number:string; issued_at:string; paid_at:string; currency:'CAD'; seller:BillingSettings; customer:{name:string;email:string;address:string}; project:{id:string;name:string}; items:{description:string;quantity:number;unit_price:number;amount:number}[]; subtotal:number; tax:number; total:number; method:PaymentMethod; reference:string; crypto_amount:string; test?:boolean}
export type Payment = {id:string;order_id:string;user_id:string;snapshot:BillingSnapshot;created_at:string;email_status:'pending'|'sending'|'sent'|'failed'|'uncertain';email_id:string|null;email_error:string|null;attempted_at:string|null}
