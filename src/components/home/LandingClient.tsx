'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock,
  ChevronDown,
  HelpCircle,
  Star,
  MapPin,
  Phone,
  Mail,
  Loader2,
  Sparkles,
  MessageSquare,
  Send
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
  active: boolean
}

interface FAQ {
  id: string
  question: string
  answer: string
}

interface Testimonial {
  name: string
  role: string
  rating: number
  review: string
}

interface Lookbook {
  title: string
  category: string
  url: string
  video?: string | null
}

interface LandingClientProps {
  categories: Category[]
  services: Service[]
  faqs: FAQ[]
  testimonials: Testimonial[]
  lookbooks: Lookbook[]
}

export default function LandingClient({
  categories: initialCategories,
  services: initialServices,
  faqs: initialFaqs,
  testimonials,
  lookbooks: initialLookbooks,
}: LandingClientProps) {
  const supabase = createClient()

  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [services, setServices] = useState<Service[]>(initialServices)
  const [faqs, setFaqs] = useState<FAQ[]>(initialFaqs)
  const [lookbooks, setLookbooks] = useState<Lookbook[]>(initialLookbooks)

  // Service category selection
  const [selectedCategory, setSelectedCategory] = useState<string>(
    initialCategories[0]?.id || ''
  )

  // Update selectedCategory if it's empty but categories are now loaded
  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(categories[0].id)
    }
  }, [categories, selectedCategory])

  // Subscribe to Realtime Postgres changes
  useEffect(() => {
    const channel = supabase
      .channel('public-realtime-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_categories' },
        async () => {
          const { data } = await supabase
            .from('service_categories')
            .select('*')
            .order('sort_order', { ascending: true })
          if (data) setCategories(data)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'services' },
        async () => {
          const { data } = await supabase
            .from('services')
            .select('*')
            .eq('active', true)
            .order('sort_order', { ascending: true })
          if (data) setServices(data)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'faq' },
        async () => {
          const { data } = await supabase
            .from('faq')
            .select('*')
            .eq('active', true)
            .order('sort_order', { ascending: true })
          if (data) setFaqs(data)
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'gallery' },
        async () => {
          const { data: galleryItems } = await supabase
            .from('gallery')
            .select('*, gallery_categories(name)')
            .order('created_at', { ascending: false })
          if (galleryItems) {
            const dbLookbooks = galleryItems.map((item) => ({
              title: item.title,
              category: (item.gallery_categories as any)?.name || 'General',
              url: item.image,
              video: item.video,
            }))
            setLookbooks(dbLookbooks.length > 0 ? dbLookbooks : initialLookbooks)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, initialLookbooks])

  // Lookbook category selection
  const lookbookCategories = ['All', 'Bridal', 'Reception', 'Makeup', 'Mehndi', 'Styling', 'Nail Art']
  const [selectedGalleryTag, setSelectedGalleryTag] = useState<string>('All')

  // FAQ open state
  const [openFaqId, setOpenFaqId] = useState<string | null>(null)

  // Contact Form State
  const [name, setName] = useState('')
  const [contactInfo, setContactInfo] = useState('') // For email or phone
  const [message, setMessage] = useState('')
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [formError, setFormError] = useState<string | null>(null)

  // Filtered services
  const filteredServices = services.filter(
    (service) => service.category_id === selectedCategory
  )

  // Filtered gallery items
  const filteredLookbooks = lookbooks.filter((item) => {
    if (selectedGalleryTag === 'All') return true
    return item.category.toLowerCase() === selectedGalleryTag.toLowerCase()
  })

  // Submit Contact Inquiry
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitting(true)
    setFormSuccess(null)
    setFormError(null)

    if (!name || !message) {
      setFormError('Please fill in both name and message.')
      setFormSubmitting(false)
      return
    }

    const { error } = await supabase.from('contact_messages').insert({
      name,
      email: contactInfo.includes('@') ? contactInfo : 'inquiry@simranmakeover.com',
      phone: !contactInfo.includes('@') ? contactInfo : '',
      message,
      status: 'unread'
    })

    if (error) {
      setFormError(error.message)
    } else {
      setFormSuccess('Your message has been sent successfully!')
      setName('')
      setContactInfo('')
      setMessage('')
    }
    setFormSubmitting(false)
  }

  // Animation variants
  const fadeInVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  } as const

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  } as const

  return (
    <>
      {/* Featured Services */}
      <section id="services" className="py-24 border-t border-[#082d25]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInVariants}
            className="text-center mb-16"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#dfba73]">Special Menu</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4 font-serif">Our Services Menu</h2>
            <div className="h-[2px] w-20 bg-[#dfba73]/40 mx-auto mb-4" />
            <p className="max-w-xl mx-auto text-xs sm:text-sm text-neutral-400">
              Browse our curated menu of professional beauty treatment options. Click on any category below.
            </p>
          </motion.div>

          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <motion.button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  selectedCategory === category.id
                    ? 'bg-[#801c34] text-white shadow-lg shadow-rose-950/20 border border-transparent'
                    : 'bg-[#04201a]/50 text-neutral-400 border border-[#082d25] hover:text-white hover:border-[#dfba73]/30'
                }`}
              >
                {category.name}
              </motion.button>
            ))}
          </div>

          {/* Service Cards Grid */}
          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <AnimatePresence mode="popLayout">
              {filteredServices.length > 0 ? (
                filteredServices.map((service) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -8, scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{
                      type: 'spring',
                      stiffness: 300,
                      damping: 20,
                      layout: { duration: 0.3 }
                    }}
                    key={service.id}
                    className="glass-panel glass-panel-hover p-8 rounded-[2rem] flex flex-col justify-between border border-[#dfba73]/5 hover:border-[#dfba73]/25 shadow-lg hover:shadow-[#dfba73]/5"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4 mb-4">
                        <h3 className="text-base font-bold text-white font-serif">{service.name}</h3>
                        <span className="text-sm font-extrabold text-[#dfba73] shrink-0">
                          ₹{service.price}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 leading-relaxed mb-6">
                        {service.description || 'Pamper yourself with our specialized service treatment.'}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-[#082d25] pt-4 mt-auto">
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
                        <Clock className="h-4 w-4 text-neutral-600" />
                        <span>{service.duration} mins</span>
                      </div>
                      <Link
                        href={`/book?service=${service.id}`}
                        className="text-xs font-bold text-[#dfba73] hover:text-white transition-colors duration-300 flex items-center gap-1 group"
                      >
                        Book Now
                        <ChevronDown className="h-3 w-3 -rotate-90 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full text-center py-12 text-neutral-500"
                >
                  No services available in this category.
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Lookbook Gallery */}
      <section id="gallery" className="py-24 border-t border-[#082d25] bg-[#031c17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInVariants}
            className="text-center mb-16"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#dfba73]">Lookbook Showcase</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4 font-serif">Lookbook Gallery</h2>
            <div className="h-[2px] w-20 bg-[#dfba73]/40 mx-auto mb-4" />
            <p className="max-w-xl mx-auto text-xs sm:text-sm text-neutral-400">
              Browse highlights of our professional bridal transformations, hairstyles, and look designs.
            </p>
          </motion.div>

          {/* Filter Tags */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {lookbookCategories.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedGalleryTag(tag)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedGalleryTag === tag
                    ? 'bg-[#dfba73] text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Gallery Grid */}
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {filteredLookbooks.map((item, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ y: -8, scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  key={`${item.title}-${idx}`}
                  className="group relative h-[360px] rounded-3xl overflow-hidden border border-[#082d25] hover:border-[#dfba73]/30 bg-neutral-900/30 shadow-lg hover:shadow-[#dfba73]/5"
                >
                  {item.video ? (
                    <video
                      src={item.video}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      autoPlay
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-75 group-hover:opacity-90 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-[#dfba73] bg-[#04201a]/90 px-2.5 py-1 rounded-full border border-[#dfba73]/10">
                      {item.category}
                    </span>
                    <h3 className="text-base font-bold text-white mt-3 font-serif">{item.title}</h3>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="reviews" className="py-24 border-t border-[#082d25]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInVariants}
            className="text-center mb-16"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#dfba73]">Testimonials</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4 font-serif">Words From Our Brides</h2>
            <div className="h-[2px] w-20 bg-[#dfba73]/40 mx-auto" />
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((t, idx) => (
              <motion.div 
                variants={fadeInVariants}
                whileHover={{ y: -6, scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                key={idx} 
                className="glass-panel p-8 rounded-[2rem] relative border border-[#dfba73]/5 hover:border-[#dfba73]/25 transition-all duration-300 shadow-lg hover:shadow-[#dfba73]/5"
              >
                <div className="flex gap-1 text-amber-500 mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-xs text-neutral-300 leading-relaxed italic mb-6">
                  &ldquo;{t.review}&rdquo;
                </p>
                <div className="border-t border-[#082d25] pt-4">
                  <h4 className="text-sm font-bold text-white font-serif">{t.name}</h4>
                  <span className="text-[10px] text-[#dfba73] uppercase tracking-widest mt-0.5 block">
                    {t.role}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 border-t border-[#082d25] bg-[#031c17]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInVariants}
            className="text-center mb-16"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#dfba73]">Information</span>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4 font-serif">Frequently Asked</h2>
            <div className="h-[2px] w-20 bg-[#dfba73]/40 mx-auto" />
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="glass-panel rounded-2xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaqId(openFaqId === faq.id ? null : faq.id)}
                  className="w-full p-6 text-left flex justify-between items-center gap-4 text-white hover:text-[#dfba73] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <HelpCircle className="h-5 w-5 text-[#dfba73] shrink-0" />
                    <span className="font-semibold text-sm sm:text-base font-serif">{faq.question}</span>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-neutral-500 shrink-0 transition-transform duration-300 ${
                      openFaqId === faq.id ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaqId === faq.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                    >
                      <div className="p-6 text-xs sm:text-sm text-neutral-400 leading-relaxed bg-[#031713]/40 border-t border-[#082d25]">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Connect With Us / Contact Inquiry (Panel 2 from screenshot) */}
      <section id="contact" className="py-24 border-t border-[#082d25]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Col: Info & Map Card */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInVariants}
              className="lg:col-span-5 space-y-8"
            >
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#dfba73]">Get in Touch</span>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mt-2 mb-4 font-serif">Connect With Us</h2>
                <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed font-light">
                  Have questions about booking availability or bridal trials? Drop us a message here or call us directly. We are happy to help!
                </p>
              </div>

              {/* Icon info list */}
              <div className="space-y-4 text-xs sm:text-sm">
                <div className="flex gap-4 items-start">
                  <div className="h-10 w-10 rounded-xl bg-[#04201a] border border-[#082d25] flex items-center justify-center text-[#dfba73] shrink-0">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-[10px] mb-0.5">Our Location</h4>
                    <span className="text-neutral-400 text-xs">Teacher&apos;s Colony, Charitravan, Buxar — 802101, Bihar</span>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="h-10 w-10 rounded-xl bg-[#04201a] border border-[#082d25] flex items-center justify-center text-[#dfba73] shrink-0">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-[10px] mb-0.5">Call Booking Support</h4>
                    <span className="text-neutral-400 text-xs">6203671358</span>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="h-10 w-10 rounded-xl bg-[#04201a] border border-[#082d25] flex items-center justify-center text-[#dfba73] shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white uppercase tracking-wider text-[10px] mb-0.5">Business Hours</h4>
                    <span className="text-neutral-400 text-xs">10:00 AM - 08:00 PM (Prior appointment suggested)</span>
                  </div>
                </div>
              </div>

              {/* Map Card */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="glass-panel p-6 rounded-3xl border-[#082d25] flex flex-col justify-center items-center text-center space-y-4"
              >
                <div className="h-12 w-12 rounded-full bg-[#04201a] border border-[#dfba73]/20 flex items-center justify-center text-[#dfba73]">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm font-serif">Teacher&apos;s Colony, Charitravan</h4>
                  <span className="text-[10px] text-neutral-500 block mt-1">Buxar — 802101, Bihar</span>
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Teachers+Colony+Charitravan+Buxar+Bihar"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-5 py-2.5 rounded-full border border-[#082d25] hover:border-[#dfba73]/30 text-[10px] font-bold uppercase tracking-wider text-neutral-300 hover:text-white transition-all bg-neutral-900/10"
                >
                  Open in Google Maps &rarr;
                </a>
              </motion.div>
            </motion.div>

            {/* Right Col: Inquiry form */}
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-100px' }}
              variants={fadeInVariants}
              className="lg:col-span-7"
            >
              <div className="glass-panel p-8 sm:p-10 rounded-[2.5rem] border-[#082d25] space-y-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-[#dfba73]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-bold text-white font-serif">Send Inquiry Message</h3>
                </div>

                {formSuccess && (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
                    {formSuccess}
                  </div>
                )}
                {formError && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleContactSubmit} className="space-y-4">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Your Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priyanshu Raj"
                      className="w-full px-4 py-3 rounded-xl border border-[#082d25] bg-[#031713] text-white placeholder-neutral-600 text-xs sm:text-sm focus:border-[#dfba73] outline-none"
                    />
                  </div>

                  {/* Contact info */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Email or Phone Number</label>
                    <input
                      type="text"
                      required
                      value={contactInfo}
                      onChange={(e) => setContactInfo(e.target.value)}
                      placeholder="e.g. email@domain.com or phone number"
                      className="w-full px-4 py-3 rounded-xl border border-[#082d25] bg-[#031713] text-white placeholder-neutral-600 text-xs sm:text-sm focus:border-[#dfba73] outline-none"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Message</label>
                    <textarea
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Write details of your event, service interest, or other questions here..."
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-[#082d25] bg-[#031713] text-white placeholder-neutral-600 text-xs sm:text-sm focus:border-[#dfba73] outline-none resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="w-full py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider glow-button-burgundy shimmer-btn flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-6"
                  >
                    {formSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Send Message <Send className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  )
}
