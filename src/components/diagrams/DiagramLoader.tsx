'use client'
import { lazy, Suspense } from 'react'

const diagrams: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  url:       lazy(() => import('./UrlDiagram')),
  dns:       lazy(() => import('./DnsDiagram')),
  tcp:       lazy(() => import('./TcpDiagram')),
  tls:       lazy(() => import('./TlsDiagram')),
  http:      lazy(() => import('./HttpDiagram')),
  html:      lazy(() => import('./HtmlDiagram')),
  css:       lazy(() => import('./CssDiagram')),
  rt:        lazy(() => import('./RenderTreeDiagram')),
  layout:    lazy(() => import('./LayoutDiagram')),
  paint:     lazy(() => import('./PaintDiagram')),
  composite: lazy(() => import('./CompositingDiagram')),
  v8:        lazy(() => import('./V8Diagram')),
  evloop:    lazy(() => import('./EventLoopDiagram')),
  cache:     lazy(() => import('./CacheDiagram')),
  cdn:       lazy(() => import('./CdnDiagram')),
  sw:        lazy(() => import('./SwDiagram')),
  frame:     lazy(() => import('./FrameDiagram')),
}

export default function DiagramLoader({ diagramKey }: { diagramKey: string }) {
  const Diagram = diagrams[diagramKey]
  if (!Diagram) return null
  return (
    <Suspense fallback={<div className="h-48 rounded-xl animate-pulse" style={{ background: 'var(--color-surface)' }} />}>
      <Diagram />
    </Suspense>
  )
}
