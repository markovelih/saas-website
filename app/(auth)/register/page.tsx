'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Check, ChevronDown, Eye, EyeOff, Loader2, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AnimatedBackground } from '@/components/animated-background'
import { register } from '../actions'
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
  <div className="absolute left-0 top-[56px] z-[999] w-full min-w-[300px] overflow-hidden rounded-2xl border border-white/[0.14] bg-black shadow-xl md:w-full">
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

          <div className="max-h-[300px] overflow-y-auto overscroll-contain scroll-smooth will-change-scroll">
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
    const result = await register(formData)

    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    }
  }

  return (
    <section className="relative min-h-screen overflow-x-hidden bg-black text-white">
      <AnimatedBackground />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1160px] items-center px-4 py-24">
        <div className="relative grid w-full overflow-visible border border-white/[0.12] bg-black/80 md:grid-cols-[1.05fr_0.95fr]">
          <div
  className="pointer-events-none absolute left-0 top-0 z-0 hidden h-[96px] w-full border-b border-white/[0.1] md:block"
  style={{
    backgroundImage: `
      linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)
    `,
    backgroundSize: '96px 96px',
  }}
/>

          <div
  className="pointer-events-none absolute bottom-0 left-0 z-0 hidden h-[96px] w-full border-t border-white/[0.1] md:block"
  style={{
    backgroundImage: `
      linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)
    `,
    backgroundSize: '96px 96px',
  }}
/>

          <CornerPlus className="pointer-events-none absolute -left-[8px] top-[96px] z-20 hidden h-4 w-4 text-white/65 md:block" />
          <CornerPlus className="pointer-events-none absolute -bottom-[8px] -right-[8px] z-20 hidden h-4 w-4 text-white/65 md:block" />

          <div className="relative z-10 p-8 pt-28 md:min-h-[760px] md:border-r md:border-white/[0.1] md:p-12 md:pt-36">
            <Link href="/" className="mb-10 inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white">
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <h1 className="max-w-[460px] text-[42px] font-bold leading-[0.98] tracking-[-0.055em] md:text-[56px]">
              Create your
              <br />
              Koryx
              <br />
              account.
            </h1>

            <div className="mt-10 space-y-8 text-[15px] leading-7 text-white/55">
              {[
                ['Track your project.', 'See updates, progress, and next steps inside your dashboard.'],
                ['Work faster.', 'Share files, requirements, and feedback in one clean place.'],
                ['Premium client access.', 'Built for serious brands and custom web projects.'],
              ].map(([title, text]) => (
                <div key={title} className="flex gap-3">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-white" />
                  <p>
                    <span className="text-white">{title}</span> {text}
                  </p>
                </div>
              ))}
            </div>

            <div className="relative z-10 mt-14 grid grid-cols-2 pt-8 before:absolute before:left-0 before:right-0 before:top-0 before:h-px before:bg-white/[0.1]">
              <div>
                <p className="text-3xl font-semibold tracking-[-0.04em]">24/7</p>
                <p className="mt-2 text-sm text-white/40">Dashboard access</p>
              </div>
              <div>
                <p className="text-3xl font-semibold tracking-[-0.04em]">Fast</p>
                <p className="mt-2 text-sm text-white/40">Project updates</p>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="relative z-10 bg-[#050505]/95 p-8 md:min-h-[760px] md:p-12 md:pt-36"
          >
            <div className="mb-8">
              <Link href="/" className="mb-8 inline-flex items-center">
  <Image
    src="/koryx-logo.png"
    alt="Koryx logo"
    width={160}
    height={40}
    className="h-auto w-[140px] object-contain"
    priority
  />
</Link>

              <h2 className="text-2xl font-semibold tracking-[-0.03em]">
                Register your account
              </h2>
              <p className="mt-2 text-sm text-white/45">
                Enter your details and we’ll set up your client dashboard.
              </p>
            </div>

            <form action={handleSubmit} className="space-y-5">
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

                <div className="grid gap-3 sm:grid-cols-[210px_minmax(0,1fr)]">
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
            </form>

            <div className="mt-8 border-t border-white/[0.1] pt-6">
              <p className="text-sm text-white/40">
                Already have an account?{' '}
                <Link href="/login" className="text-white hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
