import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'

const BASE_URL = 'https://web-internals.dev'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Web Internals — How the Web Actually Works',
    template: '%s | Web Internals',
  },
  description: 'The definitive visual guide to how the web works — from URL parsing to GPU compositing. 16 concepts explained with interactive WebGL animations, real code, and engineer-level insights.',
  keywords: ['how the web works', 'browser internals', 'DNS', 'TCP', 'TLS', 'HTTP', 'V8', 'event loop', 'rendering pipeline', 'web performance'],
  authors: [{ name: 'Web Internals' }],
  openGraph: {
    type: 'website',
    siteName: 'Web Internals',
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
