import type { Metadata } from 'next'
import { Outfit, Playfair_Display } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import FloatingCallButton from '@/components/layout/FloatingCallButton'
import './globals.css'

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
})

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
})

export const metadata: Metadata = {
  title: 'Simran Makeover | Professional Makeup Artist in Buxar, Bihar',
  description: 'Bespoke luxury makeup, bridal makeovers, party looks, hair styling, and skin treatments by Simran Makeover in Buxar, Bihar.',
  keywords: 'makeup artist, Buxar, Simran Makeover, bridal makeup, party makeup Buxar',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${playfair.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#062e26] text-neutral-100 font-sans selection:bg-[#dfba73]/30 selection:text-[#dfba73]">
        <Header />
        <main className="flex-grow pt-20">{children}</main>
        <Footer />
        <FloatingCallButton />
      </body>
    </html>
  )
}
