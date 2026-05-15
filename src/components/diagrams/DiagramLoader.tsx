'use client'
import dynamic from 'next/dynamic'

const diagramMap: Record<string, React.ComponentType> = {
  url: dynamic(() => import('./UrlDiagram')),
  dns: dynamic(() => import('./DnsDiagram')),
  tcp: dynamic(() => import('./TcpDiagram')),
  tls: dynamic(() => import('./TlsDiagram')),
  http: dynamic(() => import('./HttpDiagram')),
  html: dynamic(() => import('./HtmlDiagram')),
  css: dynamic(() => import('./CssDiagram')),
  rt: dynamic(() => import('./RenderTreeDiagram')),
  layout: dynamic(() => import('./LayoutDiagram')),
  paint: dynamic(() => import('./PaintDiagram')),
  composite: dynamic(() => import('./CompositingDiagram')),
  v8: dynamic(() => import('./V8Diagram')),
  evloop: dynamic(() => import('./EventLoopDiagram')),
  cache: dynamic(() => import('./CacheDiagram')),
  cdn: dynamic(() => import('./CdnDiagram')),
  sw: dynamic(() => import('./SwDiagram')),
}

export default function DiagramLoader({ diagramKey }: { diagramKey: string }) {
  const Diagram = diagramMap[diagramKey]
  if (!Diagram) return null
  return <Diagram />
}
