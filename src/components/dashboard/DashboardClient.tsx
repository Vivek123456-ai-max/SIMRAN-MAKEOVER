'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  User,
  Calendar,
  Clock,
  MapPin,
  Edit2,
  CheckCircle,
  XCircle,
  HelpCircle,
  TrendingUp,
  Save,
  Loader2,
  X
} from 'lucide-react'

// Local brand icon component since some lucide-react versions exclude it
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

interface Booking {
  id: string
  booking_number: string
  date: string
  time: string
  status: string
  note: string | null
  admin_note: string | null
  created_at: string
  services: {
    name: string
    price: number
    duration: number
  } | null
}

interface Profile {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  role: string | null
  gender?: string | null
  dob?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  pincode?: string | null
  instagram?: string | null
  notes?: string | null
}

interface DashboardClientProps {
  profile: Profile
  bookings: Booking[]
}

export default function DashboardClient({ profile, bookings: initialBookings }: DashboardClientProps) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>('bookings')
  const [bookingFilter, setBookingFilter] = useState<'active' | 'past'>('active')
  const supabase = createClient()
  const router = useRouter()

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select(`
        *,
        services (
          name,
          price,
          duration
        )
      `)
      .eq('customer_id', profile.id)
      .order('date', { ascending: false })
      .order('time', { ascending: false })
    if (data) {
      setBookings(data as any)
    }
  }

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `customer_id=eq.${profile.id}`
        },
        () => {
          fetchBookings()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, profile.id])

  // Profile Edit State
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [name, setName] = useState(profile.name || '')
  const [phone, setPhone] = useState(profile.phone || '')
  const [gender, setGender] = useState(profile.gender || '')
  const [dob, setDob] = useState(profile.dob || '')
  const [address, setAddress] = useState(profile.address || '')
  const [city, setCity] = useState(profile.city || '')
  const [state, setState] = useState(profile.state || '')
  const [pincode, setPincode] = useState(profile.pincode || '')
  const [instagram, setInstagram] = useState(profile.instagram || '')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Booking Cancel State
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  // Format date & time helper
  const formatDisplayDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatDisplayTime = (timeStr: string) => {
    const [h, m] = timeStr.split(':')
    const hours = parseInt(h)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${m} ${ampm}`
  }

  // Filter bookings
  const activeBookings = bookings.filter((b) =>
    ['pending', 'confirmed', 'rescheduled'].includes(b.status)
  )
  const pastBookings = bookings.filter((b) =>
    ['completed', 'cancelled', 'rejected', 'no_show'].includes(b.status)
  )

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setProfileSaving(true)
    setProfileMsg(null)

    const { error } = await supabase
      .from('profiles')
      .update({
        name,
        phone,
        gender,
        dob: dob || null,
        address,
        city,
        state,
        pincode,
        instagram,
        updated_at: new Date().toISOString(),
      })
      .eq('id', profile.id)

    if (error) {
      setProfileMsg({ type: 'error', text: error.message })
    } else {
      setProfileMsg({ type: 'success', text: 'Profile details saved successfully!' })
      setIsEditingProfile(false)
      router.refresh()
    }
    setProfileSaving(false)
  }

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment request?')) return

    setCancellingId(bookingId)
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', bookingId)

    if (error) {
      alert(`Error cancelling appointment: ${error.message}`)
    } else {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      )
    }
    setCancellingId(null)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Dashboard Top Header Banner */}
      <div className="glass-panel p-8 sm:p-10 rounded-[2.5rem] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-[#082d25]">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-neutral-950 text-xl font-bold shadow-xl shadow-amber-500/10">
            {profile.name ? profile.name.charAt(0).toUpperCase() : profile.email?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white font-serif">
              Hello, {profile.name || 'Beautiful'}
            </h1>
            <span className="text-xs text-neutral-500 block mt-1">{profile.email}</span>
          </div>
        </div>

        {/* Dashboard Tab Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-[#801c34] text-white shadow-lg shadow-rose-950/20'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
            }`}
          >
            My Appointments
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#801c34] text-white shadow-lg shadow-rose-950/20'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
            }`}
          >
            My Profile
          </button>
        </div>
      </div>

      {/* Tab Content: Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-serif">Appointments history</h2>
            <div className="flex gap-2 bg-neutral-900/50 p-1 rounded-full border border-neutral-800">
              <button
                onClick={() => setBookingFilter('active')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  bookingFilter === 'active'
                    ? 'bg-neutral-800 text-white shadow-md'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Active ({activeBookings.length})
              </button>
              <button
                onClick={() => setBookingFilter('past')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  bookingFilter === 'past'
                    ? 'bg-neutral-800 text-white shadow-md'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
              >
                Past ({pastBookings.length})
              </button>
            </div>
          </div>

          {/* Bookings Lists */}
          <div className="space-y-4">
            {(bookingFilter === 'active' ? activeBookings : pastBookings).length > 0 ? (
              (bookingFilter === 'active' ? activeBookings : pastBookings).map((booking) => (
                <div
                  key={booking.id}
                  className="glass-panel p-6 sm:p-8 rounded-[2rem] border-[#082d25] flex flex-col md:flex-row justify-between gap-6"
                >
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-mono font-bold text-neutral-400 bg-neutral-900 px-3 py-1 rounded-full">
                        {booking.booking_number}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${
                          booking.status === 'confirmed'
                            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                            : ['completed', 'done'].includes(booking.status)
                            ? 'bg-violet-500/10 border border-violet-500/20 text-violet-400'
                            : booking.status === 'pending'
                            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                            : booking.status === 'cancelled'
                            ? 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                            : 'bg-neutral-900 border border-neutral-800 text-neutral-500'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white font-serif">
                        {booking.services?.name || 'Styling Treatment'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-neutral-600" />
                          {formatDisplayDate(booking.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-neutral-600" />
                          {formatDisplayTime(booking.time)}
                        </span>
                        <span>|</span>
                        <span>{booking.services?.duration} mins</span>
                        <span>|</span>
                        <span className="font-semibold text-[#dfba73]">
                          ₹{booking.services?.price}
                        </span>
                      </div>
                    </div>

                    {booking.note && (
                      <p className="text-xs text-neutral-400 italic bg-neutral-900/10 p-3 rounded-xl border border-neutral-900/50 max-w-lg">
                        &ldquo;{booking.note}&rdquo;
                      </p>
                    )}
                    {booking.admin_note && (
                      <div className="text-xs text-amber-400 bg-amber-500/5 p-3 rounded-xl border border-amber-500/10 max-w-lg">
                        <strong>Salon Response:</strong> {booking.admin_note}
                      </div>
                    )}
                  </div>

                  {/* Booking Action Column */}
                  <div className="flex md:flex-col justify-end items-end gap-2 self-end md:self-center shrink-0">
                    {bookingFilter === 'active' && ['pending', 'confirmed'].includes(booking.status) && (
                      <button
                        disabled={cancellingId === booking.id}
                        onClick={() => handleCancelBooking(booking.id)}
                        className="px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#dfba73] hover:text-white border border-neutral-850 hover:border-[#dfba73] hover:bg-[#dfba73]/10 disabled:opacity-50 flex items-center gap-1 cursor-pointer transition-all"
                      >
                        {cancellingId === booking.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                        Cancel Request
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel p-12 text-center text-neutral-500 rounded-3xl">
                No appointments found in this category.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Profile */}
      {activeTab === 'profile' && (
        <div className="glass-panel p-8 sm:p-10 rounded-[2.5rem] border-[#082d25]">
          <div className="flex justify-between items-center mb-8 border-b border-neutral-900 pb-6">
            <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2 font-serif">
              <User className="h-5 w-5 text-[#dfba73]" /> Account Profile
            </h2>
            <button
              onClick={() => setIsEditingProfile(!isEditingProfile)}
              className="px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider text-[#dfba73] hover:text-white border border-neutral-800 hover:border-neutral-700 bg-neutral-900/50 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit2 className="h-3.5 w-3.5" />
              {isEditingProfile ? 'Cancel' : 'Edit details'}
            </button>
          </div>

          {profileMsg && (
            <div
              className={`mb-6 p-4 rounded-2xl text-xs leading-relaxed border ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              {profileMsg.text}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Full Name</label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-800 bg-[#031713] text-white placeholder-neutral-600 text-sm focus:border-[#dfba73] outline-none disabled:opacity-50"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Phone Number</label>
                <input
                  type="tel"
                  disabled={!isEditingProfile}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-800 bg-[#031713] text-white placeholder-neutral-600 text-sm focus:border-[#dfba73] outline-none disabled:opacity-50"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Gender</label>
                <select
                  disabled={!isEditingProfile}
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-800 bg-[#031713] text-white text-sm focus:border-[#dfba73] outline-none disabled:opacity-50"
                >
                  <option value="">Select Gender</option>
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Date of Birth */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">Date of Birth</label>
                <input
                  type="date"
                  disabled={!isEditingProfile}
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-800 bg-[#031713] text-white text-sm focus:border-[#dfba73] outline-none disabled:opacity-50"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-neutral-400">Address</label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street Address"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-800 bg-[#031713] text-white placeholder-neutral-600 text-sm focus:border-[#dfba73] outline-none disabled:opacity-50"
                />
              </div>

              {/* City */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-neutral-400">City</label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-800 bg-[#031713] text-white placeholder-neutral-600 text-sm focus:border-[#dfba73] outline-none disabled:opacity-50"
                />
              </div>

              {/* State & Zip */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400">State</label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="State"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-800 bg-[#031713] text-white placeholder-neutral-600 text-sm focus:border-[#dfba73] outline-none disabled:opacity-50"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-400">Pincode</label>
                  <input
                    type="text"
                    disabled={!isEditingProfile}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Zipcode"
                    className="w-full px-4 py-3 rounded-xl border border-neutral-800 bg-[#031713] text-white placeholder-neutral-600 text-sm focus:border-[#dfba73] outline-none disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Instagram handle */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-neutral-400 flex items-center gap-1.5">
                  <InstagramIcon className="h-4 w-4 text-[#dfba73]" /> Instagram Username
                </label>
                <input
                  type="text"
                  disabled={!isEditingProfile}
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="@yourhandle"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-800 bg-[#031713] text-white placeholder-neutral-600 text-sm focus:border-[#dfba73] outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {isEditingProfile && (
              <button
                type="submit"
                disabled={profileSaving}
                className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#801c34] hover:bg-[#96223d] disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-950/20"
              >
                {profileSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Save className="h-3.5 w-3.5" />
                )}
                Save profile Details
              </button>
            )}
          </form>
        </div>
      )}
    </div>
  )
}
