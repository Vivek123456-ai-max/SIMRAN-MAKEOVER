import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Authenticate user
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login?redirect=/dashboard')
  }

  // Fetch Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  // Fetch Bookings with Service Join
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      services (
        name,
        price,
        duration
      )
    `)
    .eq('customer_id', session.user.id)
    .order('date', { ascending: false })
    .order('time', { ascending: false })

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-rose-500/5 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-violet-600/5 rounded-full blur-[80px] -z-10" />

      <div className="max-w-5xl mx-auto">
        <DashboardClient
          profile={profile || { id: session.user.id, name: '', email: session.user.email, phone: '', role: 'customer' }}
          bookings={bookings || []}
        />
      </div>
    </div>
  )
}
