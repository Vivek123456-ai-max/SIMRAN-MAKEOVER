import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminClient from '@/components/admin/AdminClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()

  // Authenticate user
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login?redirect=/admin')
  }

  // Fetch Profile to verify role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single()

  if (!profile || !['admin', 'receptionist'].includes(profile.role || '')) {
    // If not admin/receptionist, redirect to standard customer dashboard
    redirect('/dashboard')
  }

  // Fetch all bookings (joined with service and customer profile)
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      services (
        id,
        name,
        price,
        duration
      ),
      profiles!bookings_customer_id_fkey (
        name,
        email,
        phone
      )
    `)
    .order('date', { ascending: false })
    .order('time', { ascending: false })

  // Fetch statistics
  // 1. Total users
  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })

  // 2. Services list for analytical displays / editors
  const { data: services } = await supabase
    .from('services')
    .select('id, name, price, duration')

  // Fetch Gallery Items
  const { data: gallery } = await supabase
    .from('gallery')
    .select('*, gallery_categories(id, name)')
    .order('created_at', { ascending: false })

  // Fetch Gallery Categories
  const { data: galleryCategories } = await supabase
    .from('gallery_categories')
    .select('id, name')

  // Fetch Time Slots
  const { data: timeSlots } = await supabase
    .from('time_slots')
    .select('id, time')
    .eq('active', true)
    .order('time', { ascending: true })

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#dfba73]/5 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-[#801c34]/5 rounded-full blur-[80px] -z-10" />

      <div className="max-w-7xl mx-auto">
        <AdminClient
          bookings={bookings || []}
          totalUsersCount={totalUsers || 0}
          servicesList={services || []}
          initialGallery={gallery || []}
          galleryCategories={galleryCategories || []}
          timeSlotsList={timeSlots || []}
        />
      </div>
    </div>
  )
}
