import Link from 'next/link'
import { ArrowLeft, Shield } from 'lucide-react'

export default function PrivacyPage() {
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
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white font-serif tracking-wide">Privacy Policy</h1>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest mt-1">Last updated: July 2026</p>
            </div>
          </div>

          <div className="space-y-6 text-sm text-neutral-300 leading-relaxed font-light">
            <p>
              Welcome to <strong>Simran Makeover</strong>. We value your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and share information when you visit our salon or use our booking platform.
            </p>

            <h2 className="text-lg font-bold text-white font-serif mt-6">1. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when booking an appointment, submitting an inquiry, or registering an account. This includes:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4 text-neutral-400">
              <li>Contact details such as name, email address, and phone number.</li>
              <li>Appointment information including date, time, notes, and selected treatments.</li>
              <li>Account credentials (usernames and passwords) when you register on our platform.</li>
              <li>Inquiry details sent through contact forms.</li>
            </ul>

            <h2 className="text-lg font-bold text-white font-serif mt-6">2. How We Use Your Information</h2>
            <p>
              We use the collected information for the following purposes:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4 text-neutral-400">
              <li>To schedule, manage, and confirm your makeup or salon consultation.</li>
              <li>To notify you about appointment confirmations, updates, or modifications.</li>
              <li>To answer questions and support requests submitted via the inquiry form.</li>
              <li>To maintain and optimize our booking dashboard and user experiences.</li>
            </ul>

            <h2 className="text-lg font-bold text-white font-serif mt-6">3. Data Sharing and Security</h2>
            <p>
              We do not sell, rent, or trade your personal data to third parties. We use secure databases (via Supabase) and implement strict access controls to protect your data from unauthorized access, modification, or disclosure.
            </p>

            <h2 className="text-lg font-bold text-white font-serif mt-6">4. Contact Information</h2>
            <p>
              If you have any questions or concerns regarding our privacy practices or would like to request details about your stored profile data, please contact us at:
            </p>
            <div className="p-4 rounded-2xl bg-neutral-950/40 border border-[#082d25] space-y-1 text-xs text-neutral-400">
              <p><strong>Simran Makeover Support</strong></p>
              <p>Teacher&apos;s Colony, Charitravan, Buxar — 802101, Bihar</p>
              <p>Phone: +91 6203671358</p>
              <p>Email: privacy@simranmakeover.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
