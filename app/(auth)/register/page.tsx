'use client'

import { useMemo, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, ChevronDown, Eye, EyeOff, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthBackdrop } from '@/components/auth-backdrop'
import { register,verifyRegistration } from '../actions'
import { toast } from 'sonner'

const countries = [
  { flag: '🇨🇦', code: '+1', name: 'Canada' },
  { flag: '🇺🇸', code: '+1', name: 'United States' },
  { flag: '🇬🇧', code: '+44', name: 'United Kingdom' },
  { flag: '🇺🇦', code: '+380', name: 'Ukraine' },
  { flag: '🇩🇪', code: '+49', name: 'Germany' },
  { flag: '🇫🇷', code: '+33', name: 'France' },
  { flag: '🇮🇹', code: '+39', name: 'Italy' },
  { flag: '🇪🇸', code: '+34', name: 'Spain' },
  { flag: '🇵🇱', code: '+48', name: 'Poland' },
  { flag: '🇳🇱', code: '+31', name: 'Netherlands' },
  { flag: '🇧🇪', code: '+32', name: 'Belgium' },
  { flag: '🇨🇭', code: '+41', name: 'Switzerland' },
  { flag: '🇦🇹', code: '+43', name: 'Austria' },
  { flag: '🇸🇪', code: '+46', name: 'Sweden' },
  { flag: '🇳🇴', code: '+47', name: 'Norway' },
  { flag: '🇩🇰', code: '+45', name: 'Denmark' },
  { flag: '🇫🇮', code: '+358', name: 'Finland' },
  { flag: '🇮🇪', code: '+353', name: 'Ireland' },
  { flag: '🇵🇹', code: '+351', name: 'Portugal' },
  { flag: '🇬🇷', code: '+30', name: 'Greece' },
  { flag: '🇨🇿', code: '+420', name: 'Czech Republic' },
  { flag: '🇸🇰', code: '+421', name: 'Slovakia' },
  { flag: '🇭🇺', code: '+36', name: 'Hungary' },
  { flag: '🇷🇴', code: '+40', name: 'Romania' },
  { flag: '🇧🇬', code: '+359', name: 'Bulgaria' },
  { flag: '🇭🇷', code: '+385', name: 'Croatia' },
  { flag: '🇷🇸', code: '+381', name: 'Serbia' },
  { flag: '🇸🇮', code: '+386', name: 'Slovenia' },
  { flag: '🇱🇹', code: '+370', name: 'Lithuania' },
  { flag: '🇱🇻', code: '+371', name: 'Latvia' },
  { flag: '🇪🇪', code: '+372', name: 'Estonia' },
  { flag: '🇦🇺', code: '+61', name: 'Australia' },
  { flag: '🇳🇿', code: '+64', name: 'New Zealand' },
  { flag: '🇯🇵', code: '+81', name: 'Japan' },
  { flag: '🇰🇷', code: '+82', name: 'South Korea' },
  { flag: '🇨🇳', code: '+86', name: 'China' },
  { flag: '🇮🇳', code: '+91', name: 'India' },
  { flag: '🇸🇬', code: '+65', name: 'Singapore' },
  { flag: '🇭🇰', code: '+852', name: 'Hong Kong' },
  { flag: '🇦🇪', code: '+971', name: 'United Arab Emirates' },
  { flag: '🇸🇦', code: '+966', name: 'Saudi Arabia' },
  { flag: '🇮🇱', code: '+972', name: 'Israel' },
  { flag: '🇹🇷', code: '+90', name: 'Turkey' },
  { flag: '🇧🇷', code: '+55', name: 'Brazil' },
  { flag: '🇲🇽', code: '+52', name: 'Mexico' },
  { flag: '🇦🇷', code: '+54', name: 'Argentina' },
  { flag: '🇨🇱', code: '+56', name: 'Chile' },
  { flag: '🇨🇴', code: '+57', name: 'Colombia' },
  { flag: '🇵🇪', code: '+51', name: 'Peru' },
  { flag: '🇿🇦', code: '+27', name: 'South Africa' },
]

type Country = (typeof countries)[number]

function CornerPlus({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 0V16" stroke="currentColor" strokeWidth="1" />
      <path d="M0 8H16" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

function formatPhoneNumber(value: string, code: string) {
  const digits = value.replace(/\D/g, '').slice(0, 15)

  if (code === '+1') {
    const a = digits.slice(0, 3)
    const b = digits.slice(3, 6)
    const c = digits.slice(6, 10)

    if (digits.length <= 3) return a
    if (digits.length <= 6) return `${a}-${b}`
    return `${a}-${b}-${c}`
  }

  return digits.replace(/(\d{3})(?=\d)/g, '$1 ').trim()
}

function CountryDropdown({
  value,
  onChange,
  mode = 'phone',
  open,
  setOpen,
}: {
  value: Country
  onChange: (country: Country) => void
  mode?: 'phone' | 'country'
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    return countries.filter((country) =>
      `${country.name} ${country.code}`.toLowerCase().includes(query)
    )
  }, [search])

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-12 w-full items-center justify-between rounded-md border border-white/[0.14] bg-black px-3 text-left text-sm text-white outline-none transition hover:border-white/[0.25]"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span className="shrink-0">{value.flag}</span>

          {mode === 'phone' ? (
            <>
              <span className="shrink-0 font-semibold">{value.code}</span>
              <span className="truncate text-white/45">{value.name}</span>
            </>
          ) : (
            <span className="truncate font-medium">{value.name}</span>
          )}
        </span>

        <ChevronDown className="h-4 w-4 shrink-0 text-white/45" />
      </button>

      {open && (
  <div className="absolute left-0 top-[56px] z-[999] w-full min-w-0 overflow-hidden rounded-2xl border border-white/[0.14] bg-black shadow-xl md:w-full">
          <div className="border-b border-white/[0.1] p-3">
            <div className="flex h-11 items-center gap-2 rounded-xl border border-white/[0.18] px-3">
              <Search className="h-4 w-4 text-white/35" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country"
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
              />
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto overscroll-contain ">
            {filtered.map((country) => (
              <button
                key={`${country.name}-${country.code}`}
                type="button"
                onClick={() => {
                  onChange(country)
                  setOpen(false)
                  setSearch('')
                }}
                className="flex w-full items-center gap-3 border-b border-white/[0.07] px-4 py-3.5 text-left text-sm transition hover:bg-white/[0.06]"
              >
                <span className="text-lg">{country.flag}</span>
                {mode === 'phone' && <span className="font-semibold text-white">{country.code}</span>}
                <span className="text-white/75">{country.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function RegisterPage() {
  const [pendingEmail,setPendingEmail]=useState(''),[verifyError,setVerifyError]=useState('');const lastForm=useRef<FormData|null>(null);
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [phoneCountry, setPhoneCountry] = useState(countries[0])
  const [selectedCountry, setSelectedCountry] = useState(countries[0])
  const [phone, setPhone] = useState('')
  const [openDropdown, setOpenDropdown] = useState<'phone' | 'country' | null>(null)

  async function handleSubmit(formData: FormData) {
    const password = String(formData.get('password') || '')
    const confirmPassword = String(formData.get('confirmPassword') || '')

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)

    formData.set('phoneCode', phoneCountry.code)
    formData.set('phone', phone.replace(/\D/g, ''))
    formData.set('country', selectedCountry.name)

    const destination=new URLSearchParams(window.location.search).get('redirect')
    if(destination)formData.set('redirect',destination)
    lastForm.current=formData;
    try {
      const result = await register(formData)
      if(result.confirmation&&result.email)setPendingEmail(result.email)
      if(result.error)toast.error(result.error)
    } catch { toast.error('Connection interrupted. Please try again.') }
    finally {setIsLoading(false)}
  }

  return (
    <section className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <AuthBackdrop />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1160px] items-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="relative grid w-full min-w-0 border border-white/[0.12] bg-black/80 md:grid-cols-2">
          <div
            aria-hidden="true"
            className="pointer-events-none relative hidden h-12 border-b border-white/[0.1] md:col-span-2 md:block"
            style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '96px 100%' }}
          >
            <CornerPlus className="absolute -bottom-2 -left-2 h-4 w-4 text-white/65" />
          </div>

          <div className="relative z-10 flex min-w-0 flex-col p-6 sm:p-8 md:border-r md:border-white/[0.1] md:p-10">
            <Link href="/" className="inline-flex h-9 w-fit items-center gap-2 text-sm text-white/45 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <h1 className="mt-8 text-[36px] font-bold leading-[1.08] tracking-[-0.045em] sm:text-[44px] md:text-[40px] lg:text-[48px]">
              <span className="block">Create your</span>
              <span className="block">Koryx account.</span>
            </h1>

            <div className="mt-8 grid gap-6 text-[15px] leading-6 text-white/55">
              {[
                ['Track your project.', 'See updates, progress, and next steps inside your dashboard.'],
                ['Work faster.', 'Share files, requirements, and feedback in one clean place.'],
                ['Premium client access.', 'Built for serious brands and custom web projects.'],
              ].map(([title, text]) => (
                <div key={title} className="grid min-w-0 grid-cols-[20px_minmax(0,1fr)] gap-3">
                  <Check className="mt-0.5 h-5 w-5 text-white" />
                  <div>
                    <p className="font-medium text-white">{title}</p>
                    <p className="mt-1">{text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-10">
              <div className="grid grid-cols-2 gap-6 border-t border-white/[0.1] pt-6">
                <div>
                  <p className="text-3xl font-semibold leading-none tracking-[-0.04em]">24/7</p>
                  <p className="mt-3 text-sm leading-5 text-white/40">Dashboard access</p>
                </div>
                <div>
                  <p className="text-3xl font-semibold leading-none tracking-[-0.04em]">Fast</p>
                  <p className="mt-3 text-sm leading-5 text-white/40">Project updates</p>
                </div>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative z-10 min-w-0 border-t border-white/[0.1] bg-[#050505]/95 p-6 sm:p-8 md:border-t-0 md:p-10"
          >
            <div className="mb-8">
              <Link href="/" aria-label="Koryx home" className="flex h-9 w-fit items-center">
                <Image src="/koryx-logo.png" alt="Koryx logo" width={160} height={40} className="h-auto w-[140px] object-contain" priority />
              </Link>
              <h2 className="mt-8 text-2xl font-semibold tracking-[-0.03em]">Register your account</h2>
              <p className="mt-2 text-sm leading-6 text-white/45">Enter your details and we’ll set up your client dashboard.</p>
            </div>

            {pendingEmail?<form action={async data=>{setIsLoading(true);setVerifyError('');data.set('email',pendingEmail);data.set('redirect',new URLSearchParams(window.location.search).get('redirect')||'/dashboard/new-order');try{const result=await verifyRegistration(data);if(result?.error)setVerifyError(result.error)}catch(error){if(error instanceof Error&&error.message==='NEXT_REDIRECT')throw error;setVerifyError('Connection interrupted. Please try again.')}finally{setIsLoading(false)}}} className="space-y-5"><h3 className="text-xl">Check your email.</h3><p className="text-sm text-white/50 break-words">We sent a confirmation code to {pendingEmail}. Enter it to finish registration.</p><label className="block text-sm text-white/70">Confirmation code<Input name="token" autoComplete="one-time-code" inputMode="numeric" pattern="[0-9]{6,8}" minLength={6} maxLength={8} required autoFocus className="h-14 text-xl tracking-[.25em] mt-3"/></label><Button disabled={isLoading} className="w-full h-12 bg-white text-black">{isLoading?'Confirming…':'Confirm email & continue'}</Button>{verifyError&&<p role="alert" className="text-sm text-red-300">{verifyError}</p>}<button type="button" className="text-sm text-white/50 hover:text-white" disabled={isLoading} onClick={()=>{if(lastForm.current)void handleSubmit(lastForm.current)}}>Resend confirmation code</button></form>:<form action={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/85">Email address</Label>
                <Input id="email" name="email" type="email" placeholder="you@example.com" required className="h-12 border-white/[0.14] bg-black text-white placeholder:text-white/30 focus-visible:ring-white/35" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-white/85">Your name</Label>
                <Input id="fullName" name="fullName" type="text" placeholder="John Doe" required className="h-12 border-white/[0.14] bg-black text-white placeholder:text-white/30 focus-visible:ring-white/35" />
              </div>

              <div className="space-y-2">
                <Label className="text-white/85">
                  Phone <span className="text-white/35">(optional)</span>
                </Label>

                <div className="grid gap-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                  <CountryDropdown
  value={phoneCountry}
  onChange={setPhoneCountry}
  mode="phone"
  open={openDropdown === 'phone'}
  setOpen={(isOpen) => setOpenDropdown(isOpen ? 'phone' : null)}
/>
                  <Input
                    name="phoneDisplay"
                    type="tel"
                    inputMode="numeric"
                    placeholder={phoneCountry.code === '+1' ? '236-838-2536' : 'Phone number'}
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value, phoneCountry.code))}
                    className="h-12 border-white/[0.14] bg-black text-white placeholder:text-white/30 focus-visible:ring-white/35"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-white/85">Country</Label>
                <CountryDropdown
  value={selectedCountry}
  onChange={setSelectedCountry}
  mode="country"
  open={openDropdown === 'country'}
  setOpen={(isOpen) => setOpenDropdown(isOpen ? 'country' : null)}
/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/85">Password</Label>
                <div className="relative">
                  <Input id="password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Create password" required minLength={8} className="h-12 border-white/[0.14] bg-black pr-10 text-white placeholder:text-white/30 focus-visible:ring-white/35" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white/85">Confirm password</Label>
                <div className="relative">
                  <Input id="confirmPassword" name="confirmPassword" type={showConfirmPassword ? 'text' : 'password'} placeholder="Repeat password" required minLength={8} className="h-12 border-white/[0.14] bg-black pr-10 text-white placeholder:text-white/30 focus-visible:ring-white/35" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition hover:text-white">
                    {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <p className="text-xs text-white/35">Password must be at least 8 characters</p>

              <Button type="submit" disabled={isLoading} className="h-12 w-full rounded-full bg-white font-semibold text-black transition hover:bg-white/90">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create account'
                )}
              </Button>
            </form>}

            <div className="mt-8 border-t border-white/[0.1] pt-6">
              <p className="text-sm text-white/40">
                Already have an account?{' '}
                <Link href="/login" className="text-white hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
          <div
            aria-hidden="true"
            className="pointer-events-none relative hidden h-8 border-t border-white/[0.1] md:col-span-2 md:block"
            style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '96px 100%' }}
          >
            <CornerPlus className="absolute -bottom-2 -right-2 h-4 w-4 text-white/65" />
          </div>
        </div>
      </div>
    </section>
  )
}
