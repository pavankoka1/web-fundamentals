'use client'
import dynamic from 'next/dynamic'

const sceneMap: Record<string, React.ComponentType> = {
  url: dynamic(() => import('./UrlScene'), { ssr: false }),
  dns: dynamic(() => import('./DnsScene'), { ssr: false }),
  tcp: dynamic(() => import('./TcpScene'), { ssr: false }),
  tls: dynamic(() => import('./TlsScene'), { ssr: false }),
  http: dynamic(() => import('./HttpScene'), { ssr: false }),
  html: dynamic(() => import('./HtmlScene'), { ssr: false }),
  css: dynamic(() => import('./CssScene'), { ssr: false }),
  renderTree: dynamic(() => import('./RenderTreeScene'), { ssr: false }),
  layout: dynamic(() => import('./LayoutScene'), { ssr: false }),
  paint: dynamic(() => import('./PaintScene'), { ssr: false }),
  compositing: dynamic(() => import('./CompositingScene'), { ssr: false }),
  v8: dynamic(() => import('./V8Scene'), { ssr: false }),
  eventLoop: dynamic(() => import('./EventLoopScene'), { ssr: false }),
  cache: dynamic(() => import('./CacheScene'), { ssr: false }),
  cdn: dynamic(() => import('./CdnScene'), { ssr: false }),
  sw: dynamic(() => import('./SwScene'), { ssr: false }),
}

export default function SceneLoader({ sceneKey }: { sceneKey: string }) {
  const Scene = sceneMap[sceneKey]
  if (!Scene) return null
  return <Scene />
}
