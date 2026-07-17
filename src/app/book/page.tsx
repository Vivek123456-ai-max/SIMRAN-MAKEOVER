import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BookingWizard from '@/components/booking/BookingWizard'

export const dynamic = 'force-dynamic'

export default async function BookPage() {
  const supabase = await createClient()

  // Get current user session. Booking requires login.
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    // Redirect to login page and redirect back to /book after login
    redirect('/login?redirect=/book')
  }

  // Get user profile details
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Fetch all service categories and their services
  const { data: categories } = await supabase
    .from('service_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  // Fetch active time slots
  const { data: timeSlots } = await supabase
    .from('time_slots')
    .select('*')
    .eq('active', true)
    .order('time', { ascending: true })

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-violet-600/5 rounded-full blur-[80px] -z-10" />

      <div className="max-w-4xl mx-auto">
        <Suspense fallback={
          <div className="glass-panel p-8 sm:p-12 rounded-[2.5rem] border-neutral-800 text-center text-neutral-400">
            Loading booking options...
          </div>
        }>
          <BookingWizard
            profile={profile || { id: session.user.id, name: '', email: session.user.email, phone: '' }}
            categories={categories || []}
            services={services || []}
            timeSlots={timeSlots || []}
          />
        </Suspense>
      </div>
    </div>
  )
}
