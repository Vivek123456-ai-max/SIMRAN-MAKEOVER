'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Sparkles,
  Clock,
  ArrowRight,
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign
} from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

interface Service {
  id: string
  category_id: string
  name: string
  slug: string
  description?: string
  price: number
  duration: number
}

interface TimeSlot {
  id: string
  time: string
  active: boolean
}

interface Profile {
  id: string
  name: string | null
  email: string | null
  phone: string | null
}

interface BookingWizardProps {
  profile: Profile
  categories: Category[]
  services: Service[]
  timeSlots: TimeSlot[]
}

export default function BookingWizard({
  profile,
  categories,
  services,
  timeSlots,
}: BookingWizardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Pre-select service from URL parameter if present
  const preSelectedServiceId = searchParams.get('service')

  // Steps: 1 = Service, 2 = Date & Time, 3 = Confirmation, 4 = Success
  const [step, setStep] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]?.id || '')
  const [selectedService, setSelectedService] = useState<Service | null>(
    services.find((s) => s.id === preSelectedServiceId) || null
  )

  // Date Selection
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [availableDays, setAvailableDays] = useState<Date[]>([])

  // Time Slots
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Booking details
  const [phone, setPhone] = useState(profile.phone || '')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successBookingNumber, setSuccessBookingNumber] = useState<string | null>(null)

  // Generate next 14 days
  useEffect(() => {
    const days = []
    const start = new Date()
    // If current time is past 7 PM, start from tomorrow
    if (start.getHours() >= 19) {
      start.setDate(start.getDate() + 1)
    }
    for (let i = 0; i < 14; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      days.push(d)
    }
    setAvailableDays(days)
    if (days.length > 0) {
      setSelectedDate(formatDateString(days[0]))
    }
  }, [])

  // If service pre-selected, go to step 2 automatically
  useEffect(() => {
    if (preSelectedServiceId && selectedService) {
      setStep(2)
    }
  }, [preSelectedServiceId, selectedService])

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!selectedDate) return

    const fetchBookedSlots = async () => {
      setLoadingSlots(true)
      const { data, error } = await supabase
        .from('bookings')
        .select('time')
        .eq('date', selectedDate)
        .not('status', 'in', '("cancelled","rejected")')

      if (error) {
        console.error('Error fetching booked slots:', error)
      } else {
        setBookedTimes(data.map((b) => b.time))
      }
      setLoadingSlots(false)
    }

    fetchBookedSlots()

    // Realtime subscription for updates to bookings on this date
    const channel = supabase
      .channel(`bookings-${selectedDate}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `date=eq.${selectedDate}`
        },
        () => {
          fetchBookedSlots()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [selectedDate, supabase])

  const formatDateString = (date: Date) => {
    const offset = date.getTimezoneOffset()
    const localDate = new Date(date.getTime() - offset * 60 * 1000)
    return localDate.toISOString().split('T')[0]
  }

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  }

  const formatDisplayTime = (timeStr: string) => {
    if (!timeStr) return ''
    const [h, m] = timeStr.split(':')
    const hours = parseInt(h)
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours % 12 || 12
    return `${displayHours}:${m} ${ampm}`
  }

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service)
    setStep(2)
  }

  const handleBookAppointment = async () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      setErrorMsg('Please select a service, date, and time slot.')
      return
    }

    if (!phone) {
      setErrorMsg('Please provide a contact phone number.')
      return
    }

    setSubmitting(true)
    setErrorMsg(null)

    // Generate unique booking number
    const random = Math.floor(1000 + Math.random() * 9000)
    const bookingNum = `SIMRAN-${Date.now().toString().slice(-6)}${random}`

    // Insert booking
    const { error: bookingError } = await supabase.from('bookings').insert({
      booking_number: bookingNum,
      customer_id: profile.id,
      service_id: selectedService.id,
      date: selectedDate,
      time: selectedTime,
      status: 'pending',
      note: notes,
    })

    if (bookingError) {
      setErrorMsg(bookingError.message)
      setSubmitting(false)
      return
    }

    // Update profile phone if not already set or changed
    if (phone !== profile.phone) {
      await supabase
        .from('profiles')
        .update({ phone })
        .eq('id', profile.id)
    }

    // Success state
    setSuccessBookingNumber(bookingNum)
    setStep(4)
    setSubmitting(false)
  }

  return (
    <div className="glass-panel p-8 sm:p-12 rounded-[2.5rem] border-[#082d25] shadow-2xl relative">
      {/* Wizard Header */}
      <div className="flex justify-between items-center mb-8 border-b border-[#082d25] pb-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#dfba73]">
            Step {step} of 4
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-1 font-serif">
            {step === 1 && 'Select Beauty Service'}
            {step === 2 && 'Schedule Date & Time'}
            {step === 3 && 'Confirm Appointment'}
            {step === 4 && 'Booking Request Sent'}
          </h2>
        </div>
        {step < 4 && (
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'bg-[#dfba73] w-8'
                    : s < step
                    ? 'bg-[#dfba73]/40'
                    : 'bg-neutral-800'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Error Panel */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
          <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Step 1: Select Service */}
      {step === 1 && (
        <div className="space-y-8 animate-fade-in">
          {/* Category List */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#dfba73] text-neutral-950 font-bold'
                    : 'bg-[#04201a]/50 text-neutral-400 border border-[#082d25] hover:text-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {services
              .filter((s) => s.category_id === selectedCategory)
              .map((service) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceSelect(service)}
                  className={`p-6 rounded-2xl text-left border transition-all flex flex-col justify-between h-48 cursor-pointer ${
                    selectedService?.id === service.id
                      ? 'border-[#dfba73] bg-[#04201a]/60 shadow-lg shadow-[#dfba73]/5'
                      : 'border-neutral-900 bg-neutral-950/40 hover:border-[#082d25]'
                  }`}
                >
                  <div>
                    <h3 className="font-bold text-white text-base font-serif">{service.name}</h3>
                    <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                      {service.description || 'Professional luxury treatment.'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center w-full pt-4 border-t border-[#082d25]">
                    <div className="flex items-center gap-1 text-xs text-neutral-500">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{service.duration} mins</span>
                    </div>
                    <span className="text-sm font-extrabold text-[#dfba73]">₹{service.price}</span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 2 && (
        <div className="space-y-8 animate-fade-in">
          {/* Service summary header */}
          {selectedService && (
            <div className="p-4 rounded-2xl bg-[#04201a]/50 border border-[#082d25] flex justify-between items-center">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-semibold">Selected Service</span>
                <h4 className="font-bold text-white text-sm font-serif">{selectedService.name}</h4>
              </div>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-[#dfba73] hover:underline cursor-pointer"
              >
                Change
              </button>
            </div>
          )}

          {/* Date Picker Cards */}
          <div>
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-[#dfba73]" /> Select Date
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin">
              {availableDays.map((day, idx) => {
                const dateStr = formatDateString(day)
                const isSelected = selectedDate === dateStr
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedDate(dateStr)
                      setSelectedTime('')
                    }}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border min-w-[80px] h-24 shrink-0 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#dfba73] bg-[#04201a]/60 text-white shadow-md shadow-[#dfba73]/5'
                        : 'border-neutral-900 bg-neutral-950 text-neutral-400 hover:border-[#082d25]'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-medium">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-lg font-bold mt-1 font-serif">
                      {day.toLocaleDateString('en-US', { day: 'numeric' })}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Time Picker Cards */}
          <div>
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#dfba73]" /> Select Time Slot
            </h3>
            {loadingSlots ? (
              <div className="flex justify-center py-6 text-neutral-500 items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-[#dfba73]" /> Retrieving available times...
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {timeSlots.map((slot) => {
                  const isBooked = bookedTimes.includes(slot.time)
                  const isSelected = selectedTime === slot.time
                  return (
                    <button
                      key={slot.id}
                      disabled={isBooked}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`py-3.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#dfba73] bg-[#04201a]/60 text-white'
                          : isBooked
                          ? 'border-neutral-900 bg-neutral-900/30 text-neutral-600 cursor-not-allowed line-through'
                          : 'border-neutral-900 bg-neutral-950 text-neutral-400 hover:border-[#082d25] hover:text-white'
                      }`}
                    >
                      {formatDisplayTime(slot.time)}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Nav buttons */}
          <div className="flex justify-between pt-6 border-t border-[#082d25]">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-neutral-400 border border-neutral-800 hover:text-white cursor-pointer"
            >
              Back
            </button>
            <button
              disabled={!selectedTime}
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#801c34] hover:bg-[#96223d] disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/20"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <div className="space-y-8 animate-fade-in">
          {/* Details Summary Card */}
          <div className="glass-panel p-6 rounded-3xl border-[#082d25] space-y-4">
            <h3 className="font-bold text-white text-base pb-3 border-b border-[#082d25] font-serif">
              Booking Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-neutral-550 block">Service</span>
                <span className="text-white font-semibold font-serif">{selectedService?.name}</span>
              </div>
              <div>
                <span className="text-neutral-555 block">Price</span>
                <span className="text-[#dfba73] font-extrabold">₹{selectedService?.price}</span>
              </div>
              <div>
                <span className="text-neutral-550 block">Date</span>
                <span className="text-white font-semibold">
                  {formatDisplayDate(selectedDate)}
                </span>
              </div>
              <div>
                <span className="text-neutral-550 block">Time</span>
                <span className="text-white font-semibold">
                  {formatDisplayTime(selectedTime)}
                </span>
              </div>
              <div>
                <span className="text-neutral-550 block">Duration</span>
                <span className="text-white font-semibold">{selectedService?.duration} minutes</span>
              </div>
              <div>
                <span className="text-neutral-550 block">Status</span>
                <span className="text-amber-400 font-semibold uppercase tracking-wider">Pending Approval</span>
              </div>
            </div>
          </div>

          {/* Form details */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400">
                Contact Phone Number (For updates) *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full px-4 py-3 rounded-xl border border-neutral-800 bg-neutral-950 text-white placeholder-neutral-600 text-sm focus:border-[#dfba73] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-400">
                Special Requests or Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="E.g., specific artist request, allergies, wedding colors..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-neutral-800 bg-neutral-950 text-white placeholder-neutral-600 text-sm focus:border-[#dfba73] outline-none resize-none"
              />
            </div>
          </div>

          {/* Nav buttons */}
          <div className="flex justify-between pt-6 border-t border-[#082d25]">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-neutral-400 border border-neutral-800 hover:text-white cursor-pointer"
            >
              Back
            </button>
            <button
              disabled={submitting}
              onClick={handleBookAppointment}
              className="px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-[#801c34] hover:bg-[#96223d] disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-950/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting Request...
                </>
              ) : (
                <>
                  Confirm & Schedule
                  <CheckCircle2 className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <div className="text-center py-12 space-y-6 animate-scale-in">
          <div className="h-20 w-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 shadow-xl shadow-emerald-500/5">
            <CheckCircle2 className="h-10 w-10 animate-bounce" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white font-serif font-bold">Your Request has been Submitted!</h3>
            <p className="text-xs text-neutral-400 mt-2 max-w-sm mx-auto leading-relaxed">
              Thank you! Your appointment request has been sent to our desk. We will confirm your slot shortly via dashboard.
            </p>
          </div>
          <div className="p-5 max-w-sm mx-auto rounded-2xl bg-neutral-900/60 border border-neutral-800 text-xs">
            <div className="flex justify-between mb-2">
              <span className="text-neutral-500">Booking Number</span>
              <span className="font-mono font-bold text-white">{successBookingNumber}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-neutral-500">Date</span>
              <span className="text-neutral-300 font-semibold">{formatDisplayDate(selectedDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Time</span>
              <span className="text-neutral-300 font-semibold">{formatDisplayTime(selectedTime)}</span>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-6">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-center"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/"
              className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-neutral-950 bg-white hover:opacity-90 text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
