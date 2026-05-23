import type { NextConfig } from 'next'

const REDIRECT_MAP: Record<string, string> = {
  '/url-parsing': '/steps/01-network/url-parsing',
  '/service-workers': '/steps/01-network/service-workers',
  '/dns-resolution': '/steps/01-network/dns-resolution',
  '/tcp-connection': '/steps/01-network/tcp-connection',
  '/tls-handshake': '/steps/01-network/tls-handshake',
  '/http-request': '/steps/01-network/http-request',
  '/http-caching': '/steps/01-network/http-caching',
  '/cdn-edge': '/steps/01-network/cdn-edge',
  '/html-parsing': '/steps/02-parsing/html-parsing',
  '/css-parsing': '/steps/02-parsing/css-parsing',
  '/v8-engine': '/steps/02-parsing/scripts-during-parsing',
  '/event-loop': '/steps/02-parsing/scripts-during-parsing',
  '/render-tree': '/steps/03-style/render-tree',
  '/layout': '/steps/04-layout/layout',
  '/paint': '/steps/05-paint/paint',
  '/compositing': '/steps/06-compositing/compositing',
  '/frame-budget': '/steps/07-display/frame-budget',
}

const nextConfig: NextConfig = {
  turbopack: {},
  typescript: {
    // R3F JSX element types conflict with SVG — runtime behaviour is correct
    ignoreBuildErrors: true,
  },
  async redirects() {
    return Object.entries(REDIRECT_MAP).map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }))
  },
}

export default nextConfig
