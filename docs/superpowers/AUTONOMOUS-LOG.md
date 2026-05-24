# Autonomous execution log

User granted blanket approval ("don't ask for permissions, break the eggs") and stepped away. This log captures progress so you can pick up where I left off.

## Session 2026-05-23

### Brainstorm complete
- Visual direction: D (Quiet Editorial Precision)
- Architecture: 7-step linear journey (URL → pixels)
- Spec committed: `aa4a5d6` — `docs/superpowers/specs/2026-05-23-tutorial-redesign-design.md`
- Future-tutorial seed: `docs/future-runtime-tutorial-topics.md`

### Decisions locked
- KOKA mark behavior: shrink (hero → mini) on scroll
- Page transitions: soft fade + slide
- Step orientation: persistent 7-dot left rail
- Type: Source Serif 4 + Geist Sans + Geist Mono
- Accent: ice cyan `#7DD3FC`
- Taxonomy: replace phases with steps (`/steps/0X-name`)

### Phase order
0. Implementation plan (writing-plans skill) — in progress
A. Foundation
B. Layout shells
C. Routing restructure
D. Existing concept refactor
E. Content port (11 new concepts)
F. Animation polish
G. Launch polish

---

_Updates appended below as work progresses._

## Phase A — Foundation ✓ complete

Commits (5):
- 680ce35 — feat: add Source Serif 4 display font
- cb0018e — feat: replace token system with Direction D — single ice cyan accent
- be2a864 — feat: add KOKA brand mark with scroll-driven shrink
- 69d68ef — feat: add shared motion primitives in src/lib/motion.ts
- ca2f935 — feat: add atomic components — GradientRule, StepBadge, ConceptCard, ProgressHairline

Files created:
- src/components/brand/KokaMark.tsx
- src/lib/motion.ts
- src/components/atoms/{GradientRule,StepBadge,ConceptCard}.tsx
- src/components/layout/ProgressHairline.tsx

Files modified:
- src/app/layout.tsx — Source Serif 4 + mount KokaMark + mount ProgressHairline
- src/app/globals.css — full Direction D token replacement

Verification: `npm run build` succeeds. `npx tsc --noEmit` shows 121 pre-existing errors in scene files (HeroScene, CdnScene, DnsScene, HttpScene, PaintScene, RenderTreeScene, SwScene, TcpScene, V8Scene — `ctx` nullability and R3F `<line>` JSX intrinsic types). Zero new errors in Phase A files. Pre-existing errors will be addressed in Phase D refactor.


## Phase B — Layout shells & data ✓ complete

Commits (4):
- c8cbcb4 — feat: add 7-step metadata in src/lib/steps.ts
- 54e8eb1 — feat: extend Topic schema with step/globalOrder mapping
- f0af4ed — feat: add StepRail — persistent 7-dot left rail
- bedd78a — feat: add page transition wrapper with AnimatePresence

Files created:
- src/lib/steps.ts
- src/components/layout/StepRail.tsx
- src/components/layout/PageTransition.tsx

Files modified:
- src/data/topics.ts — appended TOPIC_STEP_MAP, TOPIC_SOURCES, getTopicStep, getTopicsByStep
- src/app/layout.tsx — mounted StepRail + wrapped children in PageTransition

Verification: `npm run build` succeeds, 23 static pages generated. `npx tsc --noEmit` baseline = 115 (Phase A fixed 6 via font wiring). Zero new errors.

Note: Sidebar is mounted PER-PAGE in `src/app/[slug]/page.tsx`, not in root layout as plan assumed. Phase C5 adjusted to remove from per-page or via deletion of the legacy [slug] route.


## Phase C — Routing restructure ✓ complete

Commits (5):
- a4ff38b — feat: add step landing pages at /steps/[step]
- 44176e2 — feat: add concept route at /steps/[step]/[concept]
- 45873db — feat: 301-redirect old URLs to new /steps/* paths
- 052bf75 — feat: replace home with JourneyOverview — 7-step editorial entry
- 8a0b6b3 — refactor: retire Sidebar and legacy /[slug] route — StepRail is the nav now

Files created:
- src/components/step/StepLanding.tsx
- src/app/steps/[step]/page.tsx
- src/app/steps/[step]/[concept]/page.tsx
- src/components/home/JourneyOverview.tsx
- src/components/topic/ProgressTracker.tsx (moved from old [slug] dir to stable home)

Files modified:
- src/app/page.tsx — now renders JourneyOverview
- next.config.ts — added redirects() with 17 entries

Files deleted:
- src/app/[slug]/page.tsx (legacy concept route)
- src/components/layout/Sidebar.tsx

Verification: `npm run build` succeeds, 29 static pages generated. `npx tsc --noEmit` baseline 115 (unchanged).

Static pages breakdown:
- 1 home (`/`)
- 7 step landings (`/steps/01-network` through `/steps/07-display`)
- 16 concept routes (one per topic in TOPIC_STEP_MAP; frame-jank topic has no entry — Phase E gap)
- /v8-engine and /event-loop redirect to /steps/02-parsing/scripts-during-parsing (404 until Phase E creates it)


## Phase D — Existing concept refactor ✓ complete

Commits (7):
- a63c5d0 — refactor: TopicHero adopts Direction D — numbered eyebrow, no phase color
- 86b94f1 — refactor: ConceptSection adopts Direction D
- 48d5df7 — refactor: FactsGrid adopts Direction D
- 8dc5595 — refactor: InsightCallout adopts Direction D (signature simplified to {insight})
- 60aa20e — refactor: CodeDemo adopts Direction D (signature simplified)
- 1b316b4 — refactor: TopicNav adopts Direction D + uses new /steps/ URLs
- 21a4292 — refactor: concept route uses simplified component APIs

Files modified: src/components/topic/* (all 6), src/app/steps/[step]/[concept]/page.tsx
Files retained: src/lib/phaseColors.ts (still needed by scenes — Phase E rewrite scope)

Verification: `npm run build` succeeds, 29 static pages. `npx tsc --noEmit` baseline 115 (unchanged). Zero new errors.

Concept pages now read editorially: Source Serif 4 titles, ice-cyan accent, hairline borders, numbered step counter. No phase color in UI.


## Phase E — Content port ✓ complete

Commits (3):
- 18bd3e2 — feat: add 13 new concept entries (Phase E content port)
- be7f129 — feat: add PlaceholderScene with subtle accent grid
- 3443755 — feat: register 13 new sceneKeys → PlaceholderScene

Concepts added (13): resource-hints, resource-loading-priorities, scripts-during-parsing, style-recalculation, layout-tree-construction, containment, display-lists, stacking-contexts, property-trees, layer-promotion, commit-and-compositor-thread, tiling-rasterization, vsync-display

Bug fix: existing topic `frame-jank` had id mismatch with TOPIC_STEP_MAP and redirect target — renamed to `frame-budget`. Build went from 27 → 28 concept pages.

Files modified:
- src/data/topics.ts — 13 new entries, TOPIC_STEP_MAP + TOPIC_SOURCES updated, frame-jank → frame-budget rename, getAdjacentTopics now navigates by globalOrder
- src/components/scenes/SceneLoader.tsx — registered 13 placeholder sceneKeys + conceptTitle prop
- src/components/scenes/PlaceholderScene.tsx — NEW, DPR-aware canvas with pulsing accent dot grid
- src/app/steps/[step]/[concept]/page.tsx — forwards topic.title to SceneLoader
- src/components/step/StepLanding.tsx — wires newConcept + hook fields

Verification: `npm run build` succeeds, 41 static pages (28 concept + 7 step landing + 1 home + 5 misc). tsc baseline 121 (unchanged).

All 28 concepts now navigable. New concepts use PlaceholderScene (subtle accent dot grid) until real scenes are built. Existing scenes still use phase colors — to be unified in Phase F.


## Phase F — Animation & visual polish (in progress)

Commits so far:
- ee63acb — fix: use inline style for type scale CSS variables (Tailwind arbitrary values don't process clamp())
- 6d1eb30 — fix: unify phaseColor outputs to ice-cyan family (16 scenes auto-update)
- 7c4bd3a — refactor: unify hardcoded scene colors to ice-cyan family (Direction D)
- a3e90cb — fix: V8Scene pipeline accent uses ice cyan (was incorrectly mapped to negative red)

Bugs caught + fixed during visual smoke testing:
1. `text-[var(--type-X)]` arbitrary Tailwind values weren't processing the `clamp()` value in the CSS variable — titles rendered at default 16px instead of 52px. Fix: move to inline `style={{ fontSize: 'var(--type-X)' }}`. 9 occurrences across TopicHero, StepLanding, JourneyOverview.
2. Scenes had hardcoded saturated phase colors (cyan/blue/purple/amber/pink/green) bypassing phaseColors.ts. Fix: search-and-replace across 17 scene files to ice-cyan family (#7DD3FC, #A5F3FC, #BAE6FD, #67E8F9). 155 replacements.
3. V8Scene pipeline accent was pink (Execute phase color) — auto-mapped to negative red, made pipeline read as "errored". Fix: targeted re-color to ice cyan for pipeline nodes; kept deopt path as red.

Visual smoke tests (Playwright at 1440x900):
- Home (/) — KOKA mark centered + drawing, big Source Serif 4 title "From URL to pixels. In seven steps.", 7 step cards in editorial layout ✓
- Step landing (/steps/01-network) — eyebrow + step number + title + lede + 10 concept cards ✓
- Existing concept (/steps/01-network/dns-resolution) — DNS scene with ice-cyan cards, big serif title, body content + facts + insight + prev/next nav ✓
- New concept (/steps/05-paint/display-lists) — PlaceholderScene (pulsing dot grid + concept title in italic serif), body content reading well ✓


## Phase G — Launch polish ✓ complete

- Type-check: `npx tsc --noEmit` shows 115 baseline errors (all pre-existing in scene files: `TlsScene` null checks + `V8Scene` R3F SVG/Three type collision). Zero new errors.
- Build: `npm run build` succeeds. 41 static pages. 103KB shared JS, 149-153KB per route.
- Visual smoke: home, step landing, existing concept (DNS), new concept (Property trees) — all elegant, on-brand.
- Tag: `v2.0.0-design-d`

## What's done

- 7-step linear journey structure (URL → pixels) live
- Direction D visual identity applied across all UI
- KOKA brand mark animated at top, shrinking on scroll
- StepRail (left, 7 dots) navigates steps
- All 28 concepts navigable (16 existing + 12 new + 1 fold)
- Page transitions (soft fade + slide)
- Gradient hairlines, single ice-cyan accent
- Source Serif 4 + Geist Sans + Geist Mono type system
- PlaceholderScene for 13 new concepts (subtle pulsing accent grid)
- Scene colors unified to ice-cyan family (no more clashing phase colors)
- Old URLs (/url-parsing etc) 301-redirect to /steps/[step]/[concept]

## What's NOT done (future work)

- Real custom scenes for the 13 new concepts (currently using PlaceholderScene). Designed scaffolding so future scenes drop in by registering a new sceneKey in SceneLoader.
- Cleanup of dead home components (`PhaseGrid.tsx`, `ConceptCards.tsx`, `HeroSceneLoader.tsx`) — no longer imported but still in repo.
- Old HeroScene.tsx → PipelineOverview refactor (Step 0 overview hero). Currently home is editorial-only.
- 115 pre-existing tsc errors in scene null-checks + R3F types. Not affecting build (Next.js ignores during build).
- Real visual smoke against mobile Safari, Firefox, Edge.
- Lighthouse score audit (`npm run build && npm run start` + manual run).
- Sibling tutorial site "Beyond the First Frame" — spec'd in `docs/future-runtime-tutorial-topics.md`, separate project.

## Total commits this session

29 commits on `main`. Tag: `v2.0.0-design-d` on commit `a3e90cb`.


## User feedback round — visual polish (2026-05-23 evening)

User returned with 7 specific items. Dispatched 4 parallel implementer subagents.

Commits (7):
- fa13a0f — feat: top-left HomeMark + top-right MouseEye mounted globally
- 4a35bdd — feat: PipelineOverview — refactor HeroScene to Direction D 7-step animation
- 7865ba2 — feat: integrate PipelineOverview into home above step cards
- 791469e — refactor: ConceptCard with padding + hover lift, applied across StepLanding + JourneyOverview
- ab7ac90 — feat: StepRail hover scale + label slide + connecting line + click feedback
- e48d234 — feat: StepHero — per-step Canvas 2D animation on step landing pages
- 2f142b5 — feat: richen PlaceholderScene — drifting lines + better title + height bump
- 0e12a13 — fix: drop letter-spacing on PipelineOverview labels — COMPOSITING+DISPLAY were overlapping

Files created:
- src/components/brand/HomeMark.tsx — top-left home link with ice-cyan house glyph
- src/components/home/PipelineOverview.tsx — 7-step pipeline hero animation
- src/components/step/StepHero.tsx — per-step Canvas 2D animations (7 distinct variants)

Files modified:
- src/app/layout.tsx — mounted HomeMark + MouseEye
- src/components/MouseEye.tsx — repositioned to top-right, ice-cyan tint
- src/components/atoms/ConceptCard.tsx — padding + hover glow + accent border
- src/components/home/JourneyOverview.tsx — PipelineOverview integration + card hover treatment
- src/components/step/StepLanding.tsx — StepHero integration + card gap
- src/components/layout/StepRail.tsx — hover scale + label slide + connecting line
- src/components/scenes/PlaceholderScene.tsx — drifting lines + glow text
- src/lib/motion.ts — tuned railDotActive pulse

User feedback addressed (7/7):
1. ✓ Top-left HOME button (was missing — no way back to home)
2. ✓ Home page animation back (PipelineOverview — 7-stage particle flow with active highlighting)
3. ✓ Cards have padding (px-6 lg:px-8, rounded borders, hover glow)
4. ✓ StepRail hover animation (spring scale + label slide-in + connecting line)
5. ✓ Step landing pages now have StepHero (7 distinct per-step animations) + PlaceholderScene richer for new concepts
6. ✓ MouseEye mounted top-right
7. ✓ Overall UI significantly more polished

Tagged: v2.1.0-feedback (in progress)


## Second feedback round (2026-05-24)

User feedback: HomeMark too blunt, DOM/CSSOM coverage check, real animations for all 13 placeholder pages, creative elegant background animation.

16 commits in this round via 4 parallel subagents.

**HomeMark + BackgroundFX** (commits 958b989, 5186638)
- HomeMark redesigned as a refined K monogram inside a thin ice-cyan circle, with a dashed ring that rotates slowly on hover. No literal "HOME" label, no house icon. Title attribute for accessibility.
- BackgroundFX: global ambient canvas mounted as first body child. 60 ice-cyan particles drifting, occasional constellation lines when particles come within 140px, slow vertical sweep every 20s, reactive to scroll velocity (particles speed up briefly), Page Visibility API pause, reduced-motion fallback (static dotted grid).
- All <main> elements got `relative z-10` so content sits above the background.

**DOM/CSSOM content enrichment** (commit 809b65f)
- Audited html-parsing and css-parsing: both covered the PROCESS thoroughly but treated the resulting trees only as outcomes.
- Rewrote tail of html-parsing body to describe DOM as typed JS objects with parent/child/sibling pointers, ancestry queries, DocumentFragment, Shadow DOM. Added 3 new facts. Rewrote insight.
- Rewrote css-parsing body to show CSSOM hierarchy (CSSStyleSheet → CSSRuleList → CSSStyleRule), mutability via insertRule, queryability via document.styleSheets, getComputedStyle as a flush boundary. Added 3 new facts. Rewrote insight to frame DOM + CSSOM as sibling trees joined at style recalculation.

**13 real bespoke scenes** (commits 50b2444 cf81152 2582a13 53015e0 ccd2038 6461583 b8355de cecec32 25db9d6 4aa6ccf 19c375e 05297e7 b58076c)
- ResourceHintsScene — 3 lanes (no hint / preload / preconnect) waterfall showing how hints shift start time
- ResourceLoadingPrioritiesScene — 5 priority lanes with weighted packet drops + conveyor
- ScriptsDuringParsingScene — HTML parser cursor with sync script pause + defer end-of-doc fire
- StyleRecalculationScene — dirty bit propagating through DOM tree, status caption cycles
- LayoutTreeConstructionScene — DOM tree filters to layout tree, display:none nodes ghost out
- ContainmentScene — side-by-side panels: no-contain (everything jitters) vs contain: layout (only child changes)
- DisplayListsScene — paint ops appending with newest-row flash + flush sweep
- StackingContextsScene — child trapped at parent's stacking boundary, bounces back
- PropertyTreesScene — root fanning to Transform/Clip/Effect/Opacity/Scroll branches with leaves
- LayerPromotionScene — isometric tile lifts off plane onto own layer, demotes back
- CommitAndCompositorThreadScene — main → commit beam → compositor → display cycle
- TilingRasterizationScene — 8×4 tile grid fills with raster cursor, scroll triggers re-raster
- VSyncDisplayScene — 60 deterministic heartbeat bars + VSYNC beam sweep + budget meter

All 13 scenes: Canvas 2D, ice-cyan palette only, DPR-aware, IntersectionObserver pause, prefers-reduced-motion static fallback. SceneLoader.placeholderSceneKeys is now empty.

User feedback addressed (4/4):
1. ✓ HomeMark redesigned as creative K monogram glyph
2. ✓ DOM/CSSOM coverage enriched in html-parsing and css-parsing
3. ✓ All 13 placeholder concepts now have real, themed scenes
4. ✓ BackgroundFX global ambient animation on every page

Tagged: v2.2.0-polish (in progress)

