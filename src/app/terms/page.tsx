import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

export default function TermsPage() {
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
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-serif tracking-wide">Terms of Service</h1>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Last updated: July 2026</p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-neutral-300 leading-relaxed font-light">
            <p>
              Welcome to the website of <strong>Simran Makeover</strong>. By accessing our platform, booking consultations, or using our professional salon services in Buxar, Bihar, you agree to comply with and be bound by the following terms and conditions.
            </p>

            <h2 className="text-lg font-bold text-white font-serif mt-6">1. Appointment Booking & Slots</h2>
            <ul className="list-disc list-inside space-y-2 pl-4 text-neutral-400">
              <li>All booking requests submitted through this website are pending desk approval.</li>
              <li>A booking is officially confirmed only when its status changes to &quot;Confirmed&quot; in your user dashboard or when you receive confirmation contact from our reception.</li>
              <li>Clients are requested to arrive at least 10 minutes prior to their scheduled slot.</li>
            </ul>

            <h2 className="text-lg font-bold text-white font-serif mt-6">2. Rescheduling & Cancellations</h2>
            <p>
              To ensure fair availability for all clients:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4 text-neutral-400">
              <li>Rescheduling requests can be made up to 24 hours before the appointment via the user dashboard or calling Buxar support directly.</li>
              <li>In case of cancellation, please inform us as soon as possible so we can release the time slot to other customers.</li>
            </ul>

            <h2 className="text-lg font-bold text-white font-serif mt-6">3. Pricing & Payments</h2>
            <ul className="list-disc list-inside space-y-2 pl-4 text-neutral-400">
              <li>Listed prices are standard and subject to modification for customized packages (e.g. customized bridal trials or group makeups).</li>
              <li>Final billing is handled physically at the salon desk after treatments or services are rendered.</li>
            </ul>

            <h2 className="text-lg font-bold text-white font-serif mt-6">4. Modifications to Terms</h2>
            <p>
              Simran Makeover reserves the right to modify these terms at any time. Changes will be posted here and are active immediately upon publication.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
