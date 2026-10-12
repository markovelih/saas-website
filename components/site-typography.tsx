'use client'
import {usePathname} from 'next/navigation'
export function SiteTypography({children}:{children:React.ReactNode}){const path=usePathname();return <div data-typography={['/','/login','/register'].includes(path)?'original':'rounded'} className="min-h-screen min-w-0">{children}</div>}
