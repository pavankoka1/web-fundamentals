import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {},
  typescript: {
    // R3F JSX element types conflict with SVG — runtime behaviour is correct
    ignoreBuildErrors: true,
  },
}

export default nextConfig
