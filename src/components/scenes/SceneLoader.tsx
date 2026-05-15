'use client'
import { lazy, Suspense } from 'react'

const scenes: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  url:         lazy(() => import('./UrlScene')),
  dns:         lazy(() => import('./DnsScene')),
  tcp:         lazy(() => import('./TcpScene')),
  tls:         lazy(() => import('./TlsScene')),
  http:        lazy(() => import('./HttpScene')),
  html:        lazy(() => import('./HtmlScene')),
  css:         lazy(() => import('./CssScene')),
  renderTree:  lazy(() => import('./RenderTreeScene')),
  layout:      lazy(() => import('./LayoutScene')),
  paint:       lazy(() => import('./PaintScene')),
  compositing: lazy(() => import('./CompositingScene')),
  v8:          lazy(() => import('./V8Scene')),
  eventLoop:   lazy(() => import('./EventLoopScene')),
  cache:       lazy(() => import('./CacheScene')),
  cdn:         lazy(() => import('./CdnScene')),
  sw:          lazy(() => import('./SwScene')),
}

export default function SceneLoader({ sceneKey }: { sceneKey: string }) {
  const Scene = scenes[sceneKey]
  if (!Scene) return null
  return (
    <Suspense fallback={<div className="w-full h-full" style={{ background: 'var(--color-surface)' }} />}>
      <Scene />
    </Suspense>
  )
}
