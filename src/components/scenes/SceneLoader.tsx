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
  'resource-hints-placeholder':                lazy(() => import('./ResourceHintsScene')),
  'resource-loading-priorities-placeholder':   lazy(() => import('./ResourceLoadingPrioritiesScene')),
  'scripts-during-parsing-placeholder':        lazy(() => import('./ScriptsDuringParsingScene')),
  'style-recalculation-placeholder':           lazy(() => import('./StyleRecalculationScene')),
  'layout-tree-construction-placeholder':      lazy(() => import('./LayoutTreeConstructionScene')),
  'containment-placeholder':                   lazy(() => import('./ContainmentScene')),
  'display-lists-placeholder':                 lazy(() => import('./DisplayListsScene')),
  'stacking-contexts-placeholder':             lazy(() => import('./StackingContextsScene')),
  'property-trees-placeholder':                lazy(() => import('./PropertyTreesScene')),
  'layer-promotion-placeholder':               lazy(() => import('./LayerPromotionScene')),
  'commit-and-compositor-thread-placeholder':  lazy(() => import('./CommitAndCompositorThreadScene')),
}

// Phase E new concepts — all currently route to PlaceholderScene.
const placeholderSceneKeys = new Set<string>([
  'tiling-rasterization-placeholder',
  'vsync-display-placeholder',
])

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
