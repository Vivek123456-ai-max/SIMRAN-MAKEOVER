'use client'

import { useState } from 'react'
import { Phone, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function FloatingCallButton() {
  const [isOpen, setIsOpen] = useState(false)
  const phoneNumber = '6203671358'

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 select-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="glass-panel px-5 py-3 rounded-2xl border-[#dfba73]/30 shadow-2xl flex items-center gap-3 backdrop-blur-lg"
          >
            <div className="text-left">
              <span className="block text-[8px] uppercase tracking-widest text-neutral-400 font-bold">Booking Support</span>
              <a
                href={`tel:${phoneNumber}`}
                className="text-sm font-extrabold text-[#dfba73] hover:text-white transition-colors duration-300 font-mono"
              >
                {phoneNumber}
              </a>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-500 hover:text-white transition-colors p-0.5 rounded hover:bg-neutral-800/50 cursor-pointer"
              title="Close panel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="h-14 w-14 rounded-full bg-gradient-to-tr from-[#801c34] to-[#a82a47] border border-[#dfba73]/25 flex items-center justify-center text-white shadow-xl shadow-rose-950/40 relative cursor-pointer group shimmer-btn"
        title="Call Support"
      >
        {/* Pulsing ring animation */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-rose-500/20 animate-ping -z-10" />
        )}
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Phone className="h-6 w-6 group-hover:rotate-12 transition-transform duration-300" />
        )}
      </motion.button>
    </div>
  )
}
