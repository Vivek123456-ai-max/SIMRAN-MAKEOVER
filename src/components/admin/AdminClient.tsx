'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  FileText,
  Save,
  MessageSquare,
  Image as ImageIcon,
  Film,
  Plus,
  Trash2,
  ExternalLink,
  Edit,
  DollarSign
} from 'lucide-react'

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
    id: string
    name: string
    price: number
    duration: number
  } | null
  profiles: {
    name: string | null
    email: string | null
    phone: string | null
  } | null
}

interface ServiceItem {
  id: string
  name: string
  price: number
  duration: number
}

interface GalleryItem {
  id: string
  title: string
  image: string
  video: string | null
  featured: boolean
  category_id: string | null
  gallery_categories: {
    id: string
    name: string
  } | null
}

interface GalleryCategory {
  id: string
  name: string
}

interface TimeSlotItem {
  id: string
  time: string
}

interface AdminClientProps {
  bookings: Booking[]
  totalUsersCount: number
  servicesList: ServiceItem[]
  initialGallery: GalleryItem[]
  galleryCategories: GalleryCategory[]
  timeSlotsList: TimeSlotItem[]
}

export default function AdminClient({
  bookings: initialBookings,
  totalUsersCount,
  servicesList,
  initialGallery,
  galleryCategories,
  timeSlotsList,
}: AdminClientProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'gallery'>('bookings')
  const [bookings, setBookings] = useState<Booking[]>(initialBookings)
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery)
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Booking Action & Update States
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [adminNoteInput, setAdminNoteInput] = useState('')

  // Rescheduling Editor States
  const [editingBookingId, setEditingBookingId] = useState<string | null>(null)
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')
  const [editServiceId, setEditServiceId] = useState('')

  // Gallery Form State
  const [galleryTitle, setGalleryTitle] = useState('')
  const [galleryCategoryId, setGalleryCategoryId] = useState(galleryCategories[0]?.id || '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [galleryError, setGalleryError] = useState<string | null>(null)
  const [gallerySuccess, setGallerySuccess] = useState<string | null>(null)

  const supabase = createClient()
  const router = useRouter()

  const fetchBookings = async () => {
    const { data } = await supabase
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
    if (data) {
      setBookings(data as any)
    }
  }

  const fetchGallery = async () => {
    const { data } = await supabase
      .from('gallery')
      .select('*, gallery_categories(id, name)')
      .order('created_at', { ascending: false })
    if (data) {
      setGallery(data as any)
    }
  }

  // Subscribe to Realtime changes on bookings and gallery tables
  useEffect(() => {
    const channel = supabase
      .channel('admin-realtime-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          fetchBookings()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gallery' },
        () => {
          fetchGallery()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  // Metrics
  const totalBookings = bookings.length
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length
  const completedBookings = bookings.filter((b) => b.status === 'completed').length

  // Filter Bookings
  const filteredBookings = bookings.filter((booking) => {
    const customerName = booking.profiles?.name || ''
    const email = booking.profiles?.email || ''
    const phone = booking.profiles?.phone || ''
    const bookingNumber = booking.booking_number || ''
    const serviceName = booking.services?.name || ''

    const matchesSearch =
      customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phone.includes(searchQuery) ||
      bookingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      serviceName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Format helpers
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

  // Update Status
  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    setUpdatingId(bookingId)

    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', bookingId)

    if (error) {
      alert(`Error updating booking: ${error.message}`)
    } else {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      )
    }
    setUpdatingId(null)
  }

  // Save Admin Note
  const handleSaveAdminNote = async (bookingId: string) => {
    setUpdatingId(bookingId)

    const { error } = await supabase
      .from('bookings')
      .update({ admin_note: adminNoteInput, updated_at: new Date().toISOString() })
      .eq('id', bookingId)

    if (error) {
      alert(`Error saving note: ${error.message}`)
    } else {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, admin_note: adminNoteInput } : b))
      )
      setEditingNoteId(null)
    }
    setUpdatingId(null)
  }

  // Open inline reschedule editor
  const handleOpenReschedule = (booking: Booking) => {
    setEditingBookingId(booking.id)
    setEditDate(booking.date)
    setEditTime(booking.time)
    setEditServiceId(booking.services?.id || '')
  }

  // Save rescheduled appointment details
  const handleSaveReschedule = async (bookingId: string) => {
    setUpdatingId(bookingId)

    const { error } = await supabase
      .from('bookings')
      .update({
        service_id: editServiceId,
        date: editDate,
        time: editTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)

    if (error) {
      alert(`Error updating appointment details: ${error.message}`)
    } else {
      const selectedServiceObj = servicesList.find((s) => s.id === editServiceId)

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                date: editDate,
                time: editTime,
                services: selectedServiceObj
                  ? {
                      id: selectedServiceObj.id,
                      name: selectedServiceObj.name,
                      price: selectedServiceObj.price,
                      duration: selectedServiceObj.duration,
                    }
                  : b.services,
              }
            : b
        )
      )
      setEditingBookingId(null)
    }
    setUpdatingId(null)
  }

  // Add Item to Gallery
  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploadingGallery(true)
    setGalleryError(null)
    setGallerySuccess(null)

    if (!galleryTitle || !imageFile) {
      setGalleryError('A title and at least one image file is required.')
      setUploadingGallery(false)
      return
    }

    try {
      let imageUrl = ''
      let videoUrl = ''

      // 1. Upload Image
      const imgExt = imageFile.name.split('.').pop()
      const imgPath = `gallery_${Date.now()}_img.${imgExt}`
      const { error: imgUploadError } = await supabase.storage
        .from('gallery')
        .upload(imgPath, imageFile)

      if (imgUploadError) throw new Error(`Image Upload Error: ${imgUploadError.message}`)

      const { data: imgData } = supabase.storage.from('gallery').getPublicUrl(imgPath)
      imageUrl = imgData.publicUrl

      // 2. Upload Video (if provided)
      if (videoFile) {
        const vidExt = videoFile.name.split('.').pop()
        const vidPath = `gallery_${Date.now()}_vid.${vidExt}`
        const { error: vidUploadError } = await supabase.storage
          .from('gallery')
          .upload(vidPath, videoFile)

        if (vidUploadError) throw new Error(`Video Upload Error: ${vidUploadError.message}`)

        const { data: vidData } = supabase.storage.from('gallery').getPublicUrl(vidPath)
        videoUrl = vidData.publicUrl
      }

      // 3. Insert Row into DB
      const { data: insertedItem, error: insertError } = await supabase
        .from('gallery')
        .insert({
          title: galleryTitle,
          image: imageUrl,
          video: videoUrl || null,
          category_id: galleryCategoryId,
          featured: true,
        })
        .select('*, gallery_categories(id, name)')
        .single()

      if (insertError) throw insertError

      setGallery((prev) => [insertedItem as GalleryItem, ...prev])
      setGallerySuccess('Lookbook gallery item added successfully!')
      setGalleryTitle('')
      setImageFile(null)
      setVideoFile(null)
      
      // Clear file inputs physically
      const imgInput = document.getElementById('image-upload') as HTMLInputElement
      const vidInput = document.getElementById('video-upload') as HTMLInputElement
      if (imgInput) imgInput.value = ''
      if (vidInput) vidInput.value = ''

    } catch (err: any) {
      setGalleryError(err.message || 'An error occurred during submission.')
    } finally {
      setUploadingGallery(false)
    }
  }

  // Delete Item from Gallery
  const handleDeleteGalleryItem = async (itemId: string, imagePath: string, videoPath: string | null) => {
    if (!confirm('Are you sure you want to delete this lookbook item?')) return

    try {
      // 1. Delete from DB
      const { error: deleteError } = await supabase.from('gallery').delete().eq('id', itemId)
      if (deleteError) throw deleteError

      // 2. Extract storage file paths to delete from Supabase storage (optional but clean)
      if (imagePath.includes('/storage/v1/object/public/gallery/')) {
        const imgName = imagePath.split('/gallery/').pop()
        if (imgName) await supabase.storage.from('gallery').remove([imgName])
      }
      if (videoPath && videoPath.includes('/storage/v1/object/public/gallery/')) {
        const vidName = videoPath.split('/gallery/').pop()
        if (vidName) await supabase.storage.from('gallery').remove([vidName])
      }

      setGallery((prev) => prev.filter((item) => item.id !== itemId))
    } catch (err: any) {
      alert(`Error deleting item: ${err.message}`)
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Title & Tab Selector */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-neutral-900 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-serif">Desk Manager</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Review bookings, reschedule dates/times, upload customer lookbook videos/photos, and manage database listings.
          </p>
        </div>

        {/* Admin Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-[#801c34] text-white shadow-lg shadow-rose-950/20'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
            }`}
          >
            Bookings Manager
          </button>
          <button
            onClick={() => setActiveTab('gallery')}
            className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              activeTab === 'gallery'
                ? 'bg-[#801c34] text-white shadow-lg shadow-rose-950/20'
                : 'bg-neutral-900 text-neutral-400 border border-neutral-800 hover:text-white'
            }`}
          >
            Lookbook Gallery Manager
          </button>
        </div>
      </div>

      {/* Tab Panel 1: Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-8">
          {/* Analytics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="glass-panel p-6 rounded-3xl border-[#082d25]">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-500 block">Total Requests</span>
              <span className="text-2xl font-extrabold text-white block mt-2">{totalBookings}</span>
            </div>
            <div className="glass-panel p-6 rounded-3xl border-amber-500/10">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">Pending</span>
              <span className="text-2xl font-extrabold text-amber-400 block mt-2">{pendingBookings}</span>
            </div>
            <div className="glass-panel p-6 rounded-3xl border-emerald-500/10">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block">Confirmed</span>
              <span className="text-2xl font-extrabold text-emerald-400 block mt-2">{confirmedBookings}</span>
            </div>
            <div className="glass-panel p-6 rounded-3xl border-[#082d25]">
              <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block">Completed</span>
              <span className="text-2xl font-extrabold text-neutral-300 block mt-2">{completedBookings}</span>
            </div>
            <div className="glass-panel p-6 rounded-3xl col-span-2 md:col-span-1 border-[#082d25]">
              <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400 block">Customers</span>
              <span className="text-2xl font-extrabold text-violet-400 block mt-2">{totalUsersCount}</span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="glass-panel p-6 rounded-[2rem] border-[#082d25] flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-neutral-600" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by customer name, email, booking #, service..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#082d25] bg-neutral-950 text-white placeholder-neutral-600 text-sm focus:border-[#dfba73] outline-none"
              />
            </div>

            {/* Status Dropdown */}
            <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
              <span className="text-xs font-semibold text-neutral-500 flex items-center gap-1.5 shrink-0 hidden sm:flex">
                <SlidersHorizontal className="h-4 w-4" /> Filter Status:
              </span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-xl border border-[#082d25] bg-neutral-950 text-white text-xs font-semibold focus:border-[#dfba73] outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Bookings List */}
          <div className="space-y-4">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="glass-panel p-6 sm:p-8 rounded-[2.5rem] border-[#082d25] flex flex-col lg:flex-row justify-between gap-6"
                >
                  {/* Left Column: Customer details */}
                  <div className="space-y-4 w-full lg:max-w-2xl">
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

                    {/* Reschedule Inline Form */}
                    {editingBookingId === booking.id ? (
                      <div className="p-5 rounded-2xl border border-[#dfba73]/30 bg-[#04201a]/85 space-y-4 max-w-md">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-serif">
                          Reschedule Appointment
                        </h4>
                        
                        {/* Service Dropdown */}
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase font-bold text-neutral-400">Select Treatment</label>
                          <select
                            value={editServiceId}
                            onChange={(e) => setEditServiceId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-neutral-950 text-white text-xs border border-neutral-850 outline-none focus:border-[#dfba73]"
                          >
                            {servicesList.map((service) => (
                              <option key={service.id} value={service.id}>
                                {service.name} (₹{service.price})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* Date selection */}
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">Date</label>
                            <input
                              type="date"
                              value={editDate}
                              onChange={(e) => setEditDate(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-neutral-950 text-white text-xs border border-neutral-850 outline-none focus:border-[#dfba73]"
                            />
                          </div>

                          {/* Time selection */}
                          <div className="space-y-1">
                            <label className="text-[9px] uppercase font-bold text-neutral-400">Time Slot</label>
                            <select
                              value={editTime}
                              onChange={(e) => setEditTime(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl bg-neutral-950 text-white text-xs border border-neutral-850 outline-none"
                            >
                              {timeSlotsList.map((slot) => (
                                <option key={slot.id} value={slot.time}>
                                  {formatDisplayTime(slot.time)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Save/Cancel Buttons */}
                        <div className="flex gap-2 justify-end pt-2">
                          <button
                            onClick={() => setEditingBookingId(null)}
                            className="px-4 py-2 text-xs font-semibold text-neutral-400 hover:text-white border border-neutral-800 rounded-xl"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSaveReschedule(booking.id)}
                            className="px-4 py-2 text-xs font-semibold text-neutral-950 bg-[#dfba73] hover:bg-[#dfba73]/85 rounded-xl flex items-center gap-1.5"
                          >
                            <Save className="h-3.5 w-3.5" /> Save Changes
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2 font-serif">
                          {booking.services?.name}
                          <span className="text-xs font-normal text-neutral-500 font-sans">
                            (₹{booking.services?.price} | {booking.services?.duration} mins)
                          </span>
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
                          <button
                            onClick={() => handleOpenReschedule(booking)}
                            className="text-[10px] text-[#dfba73] hover:underline flex items-center gap-0.5"
                          >
                            <Edit className="h-3 w-3" /> Reschedule / Edit
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Customer Profiling */}
                    <div className="p-4 rounded-2xl bg-neutral-900/40 border border-[#082d25] space-y-2 max-w-md">
                      <div className="flex items-center gap-2 text-xs font-semibold text-white">
                        <User className="h-4 w-4 text-[#dfba73]" />
                        <span>{booking.profiles?.name || 'Guest User'}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-neutral-500">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-neutral-600" />
                          {booking.profiles?.phone || 'No phone'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-neutral-600" />
                          {booking.profiles?.email || 'No email'}
                        </span>
                      </div>
                    </div>

                    {/* Customer Notes */}
                    {booking.note && (
                      <p className="text-xs text-neutral-500 italic flex gap-1 items-start">
                        <MessageSquare className="h-4 w-4 text-neutral-600 mt-0.5 shrink-0" />
                        <span>&ldquo;{booking.note}&rdquo;</span>
                      </p>
                    )}

                    {/* Admin Note Display/Input */}
                    {editingNoteId === booking.id ? (
                      <div className="flex items-center gap-2 max-w-md">
                        <input
                          type="text"
                          value={adminNoteInput}
                          onChange={(e) => setAdminNoteInput(e.target.value)}
                          placeholder="Add receptionist / desk note..."
                          className="w-full px-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-xs text-white placeholder-neutral-600 outline-none focus:border-[#dfba73]"
                        />
                        <button
                          onClick={() => handleSaveAdminNote(booking.id)}
                          className="p-2.5 rounded-xl bg-[#801c34] text-white hover:bg-[#96223d] cursor-pointer"
                          title="Save Note"
                        >
                          <Save className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="p-2.5 rounded-xl border border-neutral-850 text-neutral-500 hover:text-white cursor-pointer"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-neutral-400">
                          <strong>Admin note:</strong>{' '}
                          {booking.admin_note || <span className="text-neutral-600 italic">None</span>}
                        </span>
                        <button
                          onClick={() => {
                            setEditingNoteId(booking.id)
                            setAdminNoteInput(booking.admin_note || '')
                          }}
                          className="text-[10px] text-[#dfba73] hover:underline cursor-pointer"
                        >
                          Edit Note
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Actions */}
                  <div className="flex flex-wrap lg:flex-col justify-center items-end gap-2 shrink-0 border-t lg:border-t-0 lg:border-l border-neutral-900 pt-4 lg:pt-0 lg:pl-6">
                    {updatingId === booking.id ? (
                      <Loader2 className="h-5 w-5 text-neutral-600 animate-spin self-center" />
                    ) : (
                      <>
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                              className="px-4 py-2 bg-emerald-650 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle className="h-4 w-4" /> Confirm Slot
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'rejected')}
                              className="px-4 py-2 border border-neutral-850 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                            >
                              <XCircle className="h-4 w-4" /> Reject
                            </button>
                          </>
                        )}

                        {booking.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'completed')}
                              className="px-4 py-2 bg-[#801c34] hover:bg-[#96223d] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle className="h-4 w-4" /> Mark Completed
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'no_show')}
                              className="px-4 py-2 border border-neutral-850 hover:bg-neutral-900 text-neutral-400 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                            >
                              No Show
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                              className="px-4 py-2 border border-neutral-850 text-rose-450 hover:bg-[#801c34]/10 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                            >
                              Cancel Booking
                            </button>
                          </>
                        )}

                        {['completed', 'cancelled', 'rejected', 'no_show'].includes(booking.status) && (
                          <button
                            onClick={() => handleUpdateStatus(booking.id, 'pending')}
                            className="px-4 py-2 border border-neutral-850 hover:bg-neutral-900 text-neutral-500 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                          >
                            Reset to Pending
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel p-12 text-center text-neutral-500 rounded-3xl">
                No matching appointments found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Panel 2: Lookbook Gallery Manager */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Upload Form */}
          <div className="lg:col-span-4 glass-panel p-8 rounded-[2rem] border-[#082d25] space-y-6">
            <h2 className="text-lg font-bold text-white font-serif flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#dfba73]" /> Add Lookbook Item
            </h2>

            {galleryError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                {galleryError}
              </div>
            )}
            {gallerySuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                {gallerySuccess}
              </div>
            )}

            <form onSubmit={handleAddGalleryItem} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Look Title</label>
                <input
                  type="text"
                  required
                  value={galleryTitle}
                  onChange={(e) => setGalleryTitle(e.target.value)}
                  placeholder="e.g. Bridal HD Airbrush"
                  className="w-full px-4 py-3 rounded-xl border border-neutral-800 bg-neutral-950 text-white placeholder-neutral-600 text-xs focus:border-[#dfba73] outline-none"
                />
              </div>

              {/* Category Selection */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Category</label>
                <select
                  value={galleryCategoryId}
                  onChange={(e) => setGalleryCategoryId(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-neutral-800 bg-neutral-950 text-white text-xs focus:border-[#dfba73] outline-none"
                >
                  {galleryCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                  <ImageIcon className="h-3.5 w-3.5 text-[#dfba73]" /> Upload Photo *
                </label>
                <input
                  type="file"
                  id="image-upload"
                  required
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-400 text-xs focus:border-[#dfba73] outline-none"
                />
              </div>

              {/* Video Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest flex items-center gap-1">
                  <Film className="h-3.5 w-3.5 text-[#dfba73]" /> Upload Video (Optional)
                </label>
                <input
                  type="file"
                  id="video-upload"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-neutral-400 text-xs focus:border-[#dfba73] outline-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={uploadingGallery}
                className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider glow-button-burgundy flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6"
              >
                {uploadingGallery ? (
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-950" />
                ) : (
                  <>
                    Upload Look <Plus className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Gallery Items Grid */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-serif">Current Gallery Items ({gallery.length})</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="glass-panel rounded-2xl overflow-hidden border-[#082d25] flex flex-col justify-between"
                >
                  <div className="relative h-44 bg-neutral-950 flex items-center justify-center overflow-hidden">
                    {item.video ? (
                      <video
                        src={item.video}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                    
                    {/* Media Type Icon indicator */}
                    <div className="absolute top-3 right-3 bg-neutral-950/80 px-2.5 py-1 rounded-full border border-[#dfba73]/10 text-[9px] text-[#dfba73] flex items-center gap-1">
                      {item.video ? (
                        <>
                          <Film className="h-3 w-3" /> Video
                        </>
                      ) : (
                        <>
                          <ImageIcon className="h-3 w-3" /> Photo
                        </>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-xs font-bold text-white font-serif truncate">{item.title}</h3>
                      <span className="text-[9px] uppercase tracking-widest text-[#dfba73]/80 block mt-1">
                        {item.gallery_categories?.name || 'General'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-t border-neutral-900 pt-3">
                      <a
                        href={item.video || item.image}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-neutral-500 hover:text-white flex items-center gap-1"
                      >
                        View File <ExternalLink className="h-3 w-3" />
                      </a>
                      <button
                        onClick={() => handleDeleteGalleryItem(item.id, item.image, item.video)}
                        className="text-[10px] text-[#dfba73] hover:text-[#dfba73]/80 flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
