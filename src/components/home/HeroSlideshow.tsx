'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const images = [
  '/luxury_salon_bg.png',
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1600&auto=format&fit=crop'
]

export default function HeroSlideshow() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, 6000) // Transition every 6 seconds
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <AnimatePresence initial={false}>
        <motion.img
          key={index}
          src={images[index]}
          alt="Simran Makeover Background Slideshow"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 0.5, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.2, ease: 'easeInOut' }}
          className="w-full h-full object-cover object-center select-none pointer-events-none absolute inset-0 z-0"
        />
      </AnimatePresence>
      {/* Dark teal gradient mask to preserve text contrast with lighter overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#062e26]/80 via-[#062e26]/75 to-[#062e26] z-10 pointer-events-none" />
    </div>
  )
}
