import Link from 'next/link'
import { ArrowLeft, DollarSign } from 'lucide-react'

export default function RefundPage() {
  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8 relative bg-[#062e26]">
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#dfba73]/5 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-[#801c34]/5 rounded-full blur-[80px] -z-10" />

      <div className="max-w-4xl mx-auto">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-[#dfba73] transition-all mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </Link>

        {/* Content Container */}
        <div className="glass-panel p-8 sm:p-12 rounded-[2.5rem] border-[#dfba73]/10 shadow-2xl space-y-8">
          <div className="flex items-center gap-4 border-b border-[#082d25] pb-6">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center text-[#dfba73]">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-serif tracking-wide">Refund Policy</h1>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Last updated: July 2026</p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-neutral-300 leading-relaxed font-light">
            <p>
              At <strong>Simran Makeover</strong>, we strive to deliver high-quality, professional salon and bridal treatments. Because our booking slots are reserved specifically for you, we maintain the following cancellation and refund policies.
            </p>

            <h2 className="text-lg font-bold text-white font-serif mt-6">1. Booking Deposits</h2>
            <ul className="list-disc list-inside space-y-2 pl-4 text-neutral-400">
              <li>Some high-demand services (such as Bridal Packages or specialized party makeups) may require an advance booking deposit to reserve the date and makeovers slot.</li>
              <li>Booking deposits are generally **non-refundable** if cancelled within 72 hours of the scheduled event date, as we hold that slot specifically for you and decline other booking inquiries.</li>
            </ul>

            <h2 className="text-lg font-bold text-white font-serif mt-6">2. Salon Service Dissatisfaction</h2>
            <p>
              Our primary goal is your complete satisfaction.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4 text-neutral-400">
              <li>If you are dissatisfied with any salon treatment or service, please inform the desk or Simran di before leaving the salon.</li>
              <li>We will make immediate attempts to adjust, style, or touch up the makeup/treatment to match your expectations.</li>
              <li>Once you leave the salon, services are deemed completed and approved, and **no refunds** will be issued for rendered services.</li>
            </ul>

            <h2 className="text-lg font-bold text-white font-serif mt-6">3. Exceptions & Support</h2>
            <p>
              We understand that emergency situations or sudden rescheduling may happen. If you have extreme medical circumstances that require cancellation, please call us directly at **+91 6203671358** as early as possible so we can evaluate exceptions on a case-by-case basis.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
