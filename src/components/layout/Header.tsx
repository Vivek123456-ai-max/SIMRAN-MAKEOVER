'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Menu, X, Sparkles, User as UserIcon, LogOut, LayoutDashboard } from 'lucide-react'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)

    // Check user auth session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      subscription.unsubscribe()
    }
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/')
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled ? 'py-3' : 'py-5'
      }`}
    >
      {/* Dynamic Background Overlay Sibling to prevent mobile drawer opacity leaks */}
      <div
        className={`absolute inset-0 -z-10 transition-all duration-500 ${
          isScrolled
            ? 'bg-[#031713]/95 backdrop-blur-md border-b border-[#082d25] shadow-lg shadow-[#031713]/40'
            : 'bg-transparent'
        }`}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/10 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="h-5 w-5 text-neutral-950 animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-widest text-[#dfba73]">
                SIMRAN
              </span>
              <span className="block text-[9px] font-bold tracking-[0.2em] text-neutral-300 -mt-1">
                MAKEOVER
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/#home"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-[#dfba73] transition-colors duration-300"
            >
              Home
            </Link>
            <Link
              href="/#services"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-[#dfba73] transition-colors duration-300"
            >
              Services
            </Link>
            <Link
              href="/#gallery"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-[#dfba73] transition-colors duration-300"
            >
              Gallery
            </Link>
            <Link
              href="/#reviews"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-[#dfba73] transition-colors duration-300"
            >
              Testimonials
            </Link>
            <Link
              href="/#faq"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-[#dfba73] transition-colors duration-300"
            >
              FAQ
            </Link>
            <Link
              href="/#contact"
              className="text-xs font-semibold uppercase tracking-wider text-neutral-300 hover:text-[#dfba73] transition-colors duration-300"
            >
              Contact Us
            </Link>
          </nav>

          {/* Desktop Auth & Booking */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-xs font-semibold text-neutral-300 hover:text-white px-3 py-1.5 rounded-full border border-neutral-800 hover:border-neutral-700 bg-neutral-900/50 transition-all"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center p-2 rounded-full border border-neutral-800 hover:border-neutral-700 bg-neutral-950 text-neutral-400 hover:text-rose-400 transition-all cursor-pointer"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors"
              >
                <UserIcon className="h-4 w-4 text-[#dfba73]" />
                Login
              </Link>
            )}

            <Link
              href="/book"
              className="relative inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#801c34] hover:bg-[#96223d] shadow-lg shadow-rose-950/20 transition-all overflow-hidden group"
            >
              <span className="absolute inset-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
              Book Now
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-3">
            <Link
              href="/book"
              className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#801c34] shadow-md shadow-rose-950/20"
            >
              Book
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-neutral-300 hover:text-white p-1 cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 right-0 w-full max-w-xs bg-black border-l border-neutral-900 p-6 z-50 transform transition-transform duration-500 ease-in-out ${
          isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <span className="text-lg font-bold tracking-wider text-[#dfba73]">SIMRAN MAKEOVER</span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-neutral-400 hover:text-white cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-col gap-6 mb-8">
          <Link
            href="/#home"
            onClick={() => setIsOpen(false)}
            className="text-sm font-semibold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors"
          >
            Home
          </Link>
          <Link
            href="/#services"
            onClick={() => setIsOpen(false)}
            className="text-sm font-semibold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors"
          >
            Services
          </Link>
          <Link
            href="/#gallery"
            onClick={() => setIsOpen(false)}
            className="text-sm font-semibold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors"
          >
            Gallery
          </Link>
          <Link
            href="/#reviews"
            onClick={() => setIsOpen(false)}
            className="text-sm font-semibold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors"
          >
            Testimonials
          </Link>
          <Link
            href="/#faq"
            onClick={() => setIsOpen(false)}
            className="text-sm font-semibold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors"
          >
            FAQ
          </Link>
          <Link
            href="/#contact"
            onClick={() => setIsOpen(false)}
            className="text-sm font-semibold uppercase tracking-wider text-neutral-300 hover:text-white transition-colors"
          >
            Contact Us
          </Link>
        </nav>

        <div className="border-t border-neutral-900 pt-6 flex flex-col gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-neutral-800 text-sm font-semibold text-white bg-neutral-900/50"
              >
                <LayoutDashboard className="h-4 w-4" />
                My Dashboard
              </Link>
              <button
                onClick={() => {
                  handleLogout()
                  setIsOpen(false)
                }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-neutral-950 text-sm font-semibold text-neutral-400 hover:text-[#dfba73] bg-neutral-950 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-neutral-800 text-sm font-semibold uppercase tracking-wider text-neutral-300 bg-neutral-950 hover:bg-neutral-900"
            >
              <UserIcon className="h-4 w-4 text-[#dfba73]" />
              Login / Register
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
