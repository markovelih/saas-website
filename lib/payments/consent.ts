import type {CareService} from './types'
// The browser approves exactly these displayed terms. Changing any term requires
// a fresh view and consent, even if the offer changed before the button click.
export function careConsentTerms(c:CareService){return JSON.stringify([c.id,c.amount_cents,c.interval,c.next_date,c.name,c.service_terms||''])}
