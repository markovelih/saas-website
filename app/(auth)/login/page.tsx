'use client'

import { useState } from 'react'
import {useRouter} from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AnimatedBackground } from '@/components/animated-background'
import { login } from '../actions'
import { toast } from 'sonner'

export default function LoginPage() {
  const router=useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    const destination = new URLSearchParams(window.location.search).get('redirect')
    if (destination) formData.set('redirect', destination)
    const result = await login(formData)
    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
    }
  }

  return (
    <>
      <AnimatedBackground />
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>

          {/* Card */}
          <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <Link href="/" className="inline-flex items-center mb-6">
  <Image
    src="/koryx-logo.png"
    alt="Koryx logo"
    width={160}
    height={40}
    className="h-auto w-[140px] object-contain"
    priority
  />
</Link>
              <h1 className="text-2xl font-bold mb-2">Your Koryx account</h1>
              <p className="text-muted-foreground">Sign in to submit a project or view your orders</p>
            </div>

            {/* Form */}
            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>

                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="h-12 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 glow"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-muted-foreground mt-6">
              {"Don't have an account? "}
              <Link href="/register" onClick={e=>{e.preventDefault();router.push("/register"+window.location.search)}} className="text-foreground hover:underline">
                Create account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  )
}
