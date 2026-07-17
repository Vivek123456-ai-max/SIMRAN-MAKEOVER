import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Sparkles, Star, ShieldCheck, Heart, Clock, ArrowRight, Calendar, MapPin, Phone } from 'lucide-react'
import LandingClient from '@/components/home/LandingClient'
import HeroSlideshow from '@/components/home/HeroSlideshow'

export const revalidate = 60 // Revalidate page every minute

export default async function Home() {
  const supabase = await createClient()

  // Fetch Categories
  const { data: categories } = await supabase
    .from('service_categories')
    .select('*')
    .order('sort_order', { ascending: true })

  // Fetch Services
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  // Fetch FAQs
  const { data: faqs } = await supabase
    .from('faq')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })

  // Fetch Gallery Items
  const { data: galleryItems } = await supabase
    .from('gallery')
    .select('*, gallery_categories(name)')
    .order('created_at', { ascending: false })

  const fallbackCategories = categories || []
  const fallbackServices = services || []
  const fallbackFaqs = faqs || []

  // Testimonials matching Simran Makeover screenshot
  const testimonials = [
    {
      name: 'Pooja Singh',
      role: 'Bride (December 2025)',
      rating: 5,
      review: 'Simran di created the absolute bridal look of my dreams! The makeup felt so light but looked stunning and flawless throughout the ceremony. Highly recommend her services in Buxar!',
    },
    {
      name: 'Neha Sharma',
      role: 'Reception Look',
      rating: 5,
      review: 'The party makeup was perfect. Everyone loved my soft curls and elegant smoky eyes. She really understands skin tones and doesn\'t make the face look dry or overdone.',
    },
    {
      name: 'Anjali Verma',
      role: 'Engagement Glow',
      rating: 5,
      review: 'Buxar\'s absolute best makeup artist. The airbrush finish was extremely flawless and natural. I got so many compliments!',
    },
  ]

  // Fallback Gallery images if database has no items
  const fallbackLookbooks = [
    { title: 'Bridal Makeup', category: 'Bridal', url: '/red_bridal_makeup.png', video: null },
    { title: 'Party Makeup', category: 'Party', url: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=600&auto=format&fit=crop', video: null },
    { title: 'Engagement Makeup', category: 'Engagement', url: '/green_bridal_makeup.png', video: null },
    { title: 'Traditional Bridal Mehndi', category: 'Mehndi', url: 'https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop', video: null },
    { title: 'Signature Waves & Updo', category: 'Styling', url: 'https://images.unsplash.com/photo-1560869713-7d0a29430f39?q=80&w=600&auto=format&fit=crop', video: null },
    { title: 'Elegant Nail Art', category: 'Nail Art', url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&auto=format&fit=crop', video: null },
  ]

  const dbLookbooks = galleryItems?.map(item => ({
    title: item.title,
    category: (item.gallery_categories as any)?.name || 'General',
    url: item.image,
    video: item.video
  })) || []

  const finalLookbooks = dbLookbooks.length > 0 ? dbLookbooks : fallbackLookbooks

  return (
    <div className="relative overflow-hidden min-h-screen bg-[#062e26]">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-[#0a3a30]/20 via-[#062e26] to-transparent -z-10" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-amber-600/5 rounded-full blur-[120px] -z-10 animate-pulse animate-drift" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#b7536d]/5 rounded-full blur-[100px] -z-10 animate-drift-reverse" />

      {/* Info Strip (Address, Call, Timings) */}
      <div className="bg-[#0a3a30] border-y border-[#082d25] py-3 text-neutral-300 text-xs font-medium">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-center">
          <div className="flex items-center gap-1.5 justify-center">
            <MapPin className="h-3.5 w-3.5 text-[#dfba73]" />
            <span>Teacher&apos;s Colony, Charitravan, Buxar - 802101</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center">
            <Phone className="h-3.5 w-3.5 text-[#dfba73]" />
            <span>Call Now: 6203671358</span>
          </div>
          <div className="flex items-center gap-1.5 justify-center">
            <Clock className="h-3.5 w-3.5 text-[#dfba73]" />
            <span>Mon - Sun: 10:00 AM - 8:00 PM</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section id="home" className="relative pt-24 pb-32 md:pt-36 md:pb-48 flex items-center justify-center overflow-hidden">
        <HeroSlideshow />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#dfba73]/20 bg-[#0a3a30]/80 text-[#dfba73] text-[10px] font-bold uppercase tracking-wider mb-8 animate-fade-in-up">
            <Sparkles className="h-3.5 w-3.5 text-[#dfba73] animate-float" />
            Professional Makeup Artist in Buxar
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif text-white tracking-tight mb-4 leading-[1.05] animate-fade-in-up delay-100">
            SIMRAN <br />
            <span className="italic font-normal text-[#dfba73] tracking-wide glow-text-gold font-serif">
              Makeover
            </span>
          </h1>

          <p className="max-w-xl mx-auto text-base text-neutral-300 font-light mb-10 leading-relaxed italic animate-fade-in-up delay-200">
            &ldquo;Beauty is our Passion, Makeover is our Art&rdquo;
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
            <Link
              href="/book"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider glow-button-burgundy shimmer-btn flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.03] active:scale-[0.97] transition-all duration-300"
            >
              <Calendar className="h-4 w-4" />
              Book Consultation &rarr;
            </Link>
            <Link
              href="#services"
              className="w-full sm:w-auto px-8 py-4 rounded-full text-xs font-bold uppercase tracking-wider text-neutral-300 border border-[#082d25] bg-neutral-900/10 hover:bg-[#0a3a30] hover:text-white transition-all flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.97]"
            >
              Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* Specializations Section (Three cards from screenshot) */}
      <section className="py-20 border-t border-[#082d25] bg-[#031c17]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#dfba73]">Featured Looks</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-4 font-serif">
              Our Signature Specializations
            </h2>
            <div className="h-[2px] w-20 bg-[#dfba73]/40 mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="glass-panel p-6 rounded-3xl space-y-4 hover:border-[#dfba73]/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/5">
              <div className="h-64 rounded-2xl overflow-hidden relative">
                <img
                  src="/red_bridal_makeup.png"
                  alt="Bridal Makeup"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-white font-serif">Bridal Makeup</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Timeless traditional looks with high-definition finish.
              </p>
              <Link
                href="/book?service=bridal"
                className="text-xs font-bold text-[#dfba73] flex items-center gap-1 hover:underline"
              >
                View Details &rarr;
              </Link>
            </div>

            {/* Card 2 */}
            <div className="glass-panel p-6 rounded-3xl space-y-4 hover:border-[#dfba73]/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/5">
              <div className="h-64 rounded-2xl overflow-hidden relative">
                <img
                  src="https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?q=80&w=600&auto=format&fit=crop"
                  alt="Party Makeup"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-white font-serif">Party Makeup</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Glamorous, radiant finishes tailored to shine.
              </p>
              <Link
                href="/book?service=party"
                className="text-xs font-bold text-[#dfba73] flex items-center gap-1 hover:underline"
              >
                View Details &rarr;
              </Link>
            </div>

            {/* Card 3 */}
            <div className="glass-panel p-6 rounded-3xl space-y-4 hover:border-[#dfba73]/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/5">
              <div className="h-64 rounded-2xl overflow-hidden relative">
                <img
                  src="/green_bridal_makeup.png"
                  alt="Engagement Makeup"
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-white font-serif">Engagement Makeup</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Soft, glowing peach-pink styles for your special day.
              </p>
              <Link
                href="/book?service=engagement"
                className="text-xs font-bold text-[#dfba73] flex items-center gap-1 hover:underline"
              >
                View Details &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Perfection Banner Block */}
      <section className="py-20 relative bg-[#801c34] text-center text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10 -z-10" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative">
          <HeartIcon className="h-8 w-8 text-[#dfba73] mx-auto animate-pulse" />
          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-white">
            Your Big Day Deserves Nothing Less <br className="hidden sm:block" /> Than Perfection
          </h2>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-rose-100 font-light leading-relaxed">
            From classic bridal aesthetics to modern high-glam, Simran creates custom makeup and hair styles that match your personality and make you stand out.
          </p>
          <div className="pt-4">
            <Link
              href="/book"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider text-[#dfba73] bg-[#062e26] hover:bg-[#0a3a30] shadow-xl transition-all"
            >
              Request a Booking
            </Link>
          </div>
        </div>
      </section>

      {/* Services, Gallery, Testimonials, FAQ & Connect Panel */}
      <LandingClient
        categories={fallbackCategories}
        services={fallbackServices}
        faqs={fallbackFaqs}
        testimonials={testimonials}
        lookbooks={finalLookbooks}
      />
    </div>
  )
}

function HeartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </svg>
  )
}
