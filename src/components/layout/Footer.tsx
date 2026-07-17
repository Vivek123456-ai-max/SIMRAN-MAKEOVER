import Link from 'next/link'
import { Sparkles, Phone, Mail, MapPin, Clock } from 'lucide-react'

// Local brand icon components since some lucide-react versions exclude them
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

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.704 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
)

export default function Footer() {
  return (
    <footer className="bg-neutral-950/80 border-t border-[#082d25] pt-16 pb-8 text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Col */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber-450 to-amber-600 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-neutral-950" />
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
            <p className="text-xs leading-relaxed text-neutral-500">
              Discover a new standard of bridal aesthetics and professional makeovers by Simran Makeover in Buxar, Bihar.
            </p>
            <div className="flex gap-4 pt-2">
              <a 
                href="https://www.instagram.com/simranmakeup__/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors duration-300"
                title="Instagram"
              >
                <InstagramIcon className="h-5 w-5" />
              </a>
              <a 
                href="https://wa.me/916203671358" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-white transition-colors duration-300"
                title="WhatsApp"
              >
                <WhatsAppIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links Col */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-6">Explore</h3>
            <ul className="space-y-3 text-xs">
              <li>
                <Link href="/#services" className="hover:text-[#dfba73] transition-colors duration-300">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/#gallery" className="hover:text-[#dfba73] transition-colors duration-300">
                  Lookbook Gallery
                </Link>
              </li>
              <li>
                <Link href="/#reviews" className="hover:text-[#dfba73] transition-colors duration-300">
                  Testimonials
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="hover:text-[#dfba73] transition-colors duration-300">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Business Hours Col */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-6">Salon Hours</h3>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-[#dfba73]" />
                <span>Mon - Sun: 10:00 AM - 08:00 PM</span>
              </li>
              <li className="text-[10px] text-neutral-600">
                <span>(Prior appointment suggested)</span>
              </li>
            </ul>
          </div>

          {/* Contacts Col */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-6">Find Us</h3>
            <ul className="space-y-3 text-xs">
              <li className="flex gap-3 items-start">
                <MapPin className="h-5 w-5 text-[#dfba73] shrink-0 mt-0.5" />
                <span>Teacher&apos;s Colony, Charitravan, Buxar — 802101, Bihar</span>
              </li>
              <li className="flex gap-3 items-center">
                <Phone className="h-5 w-5 text-[#dfba73] shrink-0" />
                <span>6203671358</span>
              </li>
              <li className="flex gap-3 items-center">
                <Mail className="h-5 w-5 text-[#dfba73] shrink-0" />
                <span>info@simranmakeover.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-[#082d25] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-600">
          <p>&copy; {new Date().getFullYear()} Simran Makeover. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-neutral-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-neutral-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/refund" className="hover:text-neutral-400 transition-colors">
              Refund Policy
            </Link>
            <Link href="/admin" className="hover:text-[#dfba73] text-[#dfba73]/80 font-bold transition-all">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
