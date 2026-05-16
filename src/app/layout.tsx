import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

const BASE_URL = 'https://web-internals.dev'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Trace — From URL to Pixel',
    template: '%s | Trace',
  },
  description: 'Trace the full journey of a web request — from typing a URL to the final pixel on screen. 16 concepts explained with interactive WebGL animations, plain English, and real engineer insights.',
  keywords: ['how the web works', 'browser internals', 'DNS', 'TCP', 'TLS', 'HTTP', 'V8', 'event loop', 'rendering pipeline', 'web performance'],
  authors: [{ name: 'Trace' }],
  openGraph: {
    type: 'website',
    siteName: 'Trace',
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
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}
