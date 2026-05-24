import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Source_Serif_4 } from 'next/font/google'
import { KokaMark } from '@/components/brand/KokaMark'
import { HomeMark } from '@/components/brand/HomeMark'
import { MouseEye } from '@/components/MouseEye'
import { BackgroundFX } from '@/components/layout/BackgroundFX'
import { ProgressHairline } from '@/components/layout/ProgressHairline'
import { StepRail } from '@/components/layout/StepRail'
import { SectionRail } from '@/components/layout/SectionRail'
import { PageTransition } from '@/components/layout/PageTransition'
import './globals.css'

const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['400', '500'],
  display: 'swap',
  variable: '--font-display',
})

const BASE_URL = 'https://web-internals.dev'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Web Fundamentals — Under the Hood',
    template: '%s | Web Fundamentals',
  },
  description: 'Web Fundamentals: how the web actually works, under the hood. 16 concepts from URL to the final pixel on screen — DNS, TCP, TLS, HTTP, rendering, and more. Interactive animations, plain English.',
  keywords: ['how the web works', 'browser internals', 'DNS', 'TCP', 'TLS', 'HTTP', 'V8', 'event loop', 'rendering pipeline', 'web performance'],
  authors: [{ name: 'Web Fundamentals' }],
  openGraph: {
    type: 'website',
    siteName: 'Web Fundamentals',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  category: 'technology',
  verification: {},
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} ${sourceSerif.variable}`}>
      <body>
        <BackgroundFX />
        <KokaMark />
        <HomeMark />
        <MouseEye />
        <ProgressHairline />
        <StepRail />
        <SectionRail />
        <PageTransition>{children}</PageTransition>
      </body>
    </html>
  )
}
