import {ThemeSwitch} from '@/components/manager/theme'
export function AuthBackdrop(){return <><div aria-hidden="true" className="auth-backdrop pointer-events-none absolute inset-0 overflow-hidden"><div className="auth-grid absolute inset-0 opacity-15"/></div><div className="fixed top-4 right-4 z-40"><ThemeSwitch/></div></>}
