'use client'
import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react'
import SceneBoundary from '@/components/SceneBoundary'

const PlaceholderScene = lazy(() => import('./PlaceholderScene'))

// Scenes with their own custom visualization.
const customScenes: Record<string, LazyExoticComponent<ComponentType>> = {
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
  frameBudget: lazy(() => import('./FrameBudgetScene')),
  'resource-hints-scene':                lazy(() => import('./ResourceHintsScene')),
  'resource-loading-priorities-scene':   lazy(() => import('./ResourceLoadingPrioritiesScene')),
  'scripts-during-parsing-scene':        lazy(() => import('./ScriptsDuringParsingScene')),
  'style-recalculation-scene':           lazy(() => import('./StyleRecalculationScene')),
  'layout-tree-construction-scene':      lazy(() => import('./LayoutTreeConstructionScene')),
  'containment-scene':                   lazy(() => import('./ContainmentScene')),
  'display-lists-scene':                 lazy(() => import('./DisplayListsScene')),
  'stacking-contexts-scene':             lazy(() => import('./StackingContextsScene')),
  'property-trees-scene':                lazy(() => import('./PropertyTreesScene')),
  'layer-promotion-scene':               lazy(() => import('./LayerPromotionScene')),
  'commit-and-compositor-thread-scene':  lazy(() => import('./CommitAndCompositorThreadScene')),
  'tiling-rasterization-scene':          lazy(() => import('./TilingRasterizationScene')),
  'vsync-display-scene':                 lazy(() => import('./VSyncDisplayScene')),
}

// Reserved for any future concepts that need to fall back to a generic placeholder visualization.
const placeholderSceneKeys = new Set<string>([])

interface SceneLoaderProps {
  sceneKey: string
  conceptTitle?: string
}

export default function SceneLoader({ sceneKey, conceptTitle }: SceneLoaderProps) {
  const CustomScene = customScenes[sceneKey]

  // Resolve to placeholder if explicitly registered, or if the key has the
  // -placeholder suffix (defensive fall-through for future new concepts).
  const isPlaceholder =
    !CustomScene &&
    (placeholderSceneKeys.has(sceneKey) || sceneKey.endsWith('-placeholder'))

  if (!CustomScene && !isPlaceholder) return null

  return (
    <SceneBoundary>
      <Suspense
        fallback={
          <div className="w-full h-full" style={{ background: 'var(--color-surface)' }} />
        }
      >
        {CustomScene ? (
          <CustomScene />
        ) : (
          <PlaceholderScene conceptTitle={conceptTitle} />
        )}
      </Suspense>
    </SceneBoundary>
  )
}
