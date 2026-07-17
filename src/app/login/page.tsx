'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from 'lucide-react'

function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  // If already logged in, redirect
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push(redirect)
      }
    }
    checkUser()
  }, [supabase, router, redirect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    if (isSignUp) {
      // Validate inputs
      if (!name || !email || !password) {
        setErrorMsg('Please fill in all required fields.')
        setLoading(false)
        return
      }

      const signUpEmail = email.includes('@') ? email : `${email}@simranmakeover.com`

      const { data, error } = await supabase.auth.signUp({
        email: signUpEmail,
        password,
        options: {
          data: {
            name: name,
            phone: phone,
          },
        },
      })

      if (error) {
        setErrorMsg(error.message)
      } else {
        setSuccessMsg(
          'Registration successful! Please check your email for verification link or log in if auto-confirmed.'
        )
        // Auto update profile phone if trigger succeeded
        if (data.user && phone) {
          await supabase
            .from('profiles')
            .update({ phone: phone })
            .eq('id', data.user.id)
        }
        setIsSignUp(false)
      }
    } else {
      if (!email || !password) {
        setErrorMsg('Please enter both email/username and password.')
        setLoading(false)
        return
      }

      let loginEmail = email.trim()
      if (
        loginEmail.toLowerCase() === 'vivek802101' ||
        loginEmail.toLowerCase() === 'vivek802101@simranmakeover.com'
      ) {
        loginEmail = 'ktvivek12345@gmail.com'
      } else if (!loginEmail.includes('@')) {
        loginEmail = `${loginEmail}@simranmakeover.com`
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      })

      if (error) {
        setErrorMsg(error.message)
      } else {
        router.push(redirect)
        router.refresh()
      }
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative border-neutral-800">
      {/* Brand/Header */}
      <div className="text-center mb-8">
        <div className="inline-flex h-12 w-12 rounded-full bg-gradient-to-tr from-amber-455 to-amber-600 items-center justify-center mb-4">
          <Sparkles className="h-6 w-6 text-neutral-950" />
        </div>
        <h2 className="text-2xl font-bold text-white tracking-wide font-serif">
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h2>
        <p className="text-xs text-neutral-500 mt-2">
          {isSignUp
            ? 'Join Simran Makeover to book custom pamper slots.'
            : 'Enter your credentials to access bookings & dashboard.'}
        </p>
      </div>

      {/* Error/Success messages */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs leading-relaxed">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs leading-relaxed">
          {successMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <>
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400">Full Name *</label>
              <div className="relative">
                <User className="absolute left-4 top-3.5 h-4.5 w-4.5 text-neutral-600" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-800 bg-neutral-950 text-white placeholder-neutral-600 text-sm focus:border-[#dfba73] focus:ring-1 focus:ring-[#dfba73] outline-none transition-all"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-4 top-3.5 h-4.5 w-4.5 text-neutral-600" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-800 bg-neutral-950 text-white placeholder-neutral-600 text-sm focus:border-[#dfba73] focus:ring-1 focus:ring-[#dfba73] outline-none transition-all"
                />
              </div>
            </div>
          </>
        )}

        {/* Email / Username */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-neutral-400">Email or Username *</label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 h-4.5 w-4.5 text-neutral-600" />
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com or username"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-neutral-800 bg-neutral-950 text-white placeholder-neutral-600 text-sm focus:border-[#dfba73] focus:ring-1 focus:ring-[#dfba73] outline-none transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-neutral-400">Password *</label>
            {!isSignUp && (
              <Link
                href="/forgot"
                className="text-[10px] font-medium text-neutral-500 hover:text-[#dfba73] transition-colors"
              >
                Forgot Password?
              </Link>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 h-4.5 w-4.5 text-neutral-600" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-12 pr-12 py-3 rounded-xl border border-neutral-800 bg-neutral-950 text-white placeholder-neutral-600 text-sm focus:border-[#dfba73] focus:ring-1 focus:ring-[#dfba73] outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-3.5 text-neutral-500 hover:text-neutral-300"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white glow-button-burgundy flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-neutral-950" />
          ) : isSignUp ? (
            'Create Account'
          ) : (
            'Log In'
          )}
        </button>
      </form>

      {/* Toggle Mode */}
      <div className="text-center mt-6 text-xs">
        <span className="text-neutral-500">
          {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
        </span>
        <button
          onClick={() => {
            setIsSignUp(!isSignUp)
            setErrorMsg(null)
            setSuccessMsg(null)
          }}
          className="font-semibold text-[#dfba73] hover:text-[#dfba73]/80 hover:underline transition-all cursor-pointer"
        >
          {isSignUp ? 'Log In' : 'Sign Up'}
        </button>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 relative">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-[#dfba73]/5 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-[#801c34]/5 rounded-full blur-3xl -z-10" />

      <Suspense fallback={
        <div className="w-full max-w-md glass-panel p-8 sm:p-10 rounded-[2.5rem] border-neutral-800 text-center flex items-center justify-center gap-2 text-neutral-400">
          <Loader2 className="h-5 w-5 animate-spin text-[#dfba73]" />
          <span>Loading secure login portal...</span>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  )
}
