# Web Internals — Design Spec
**Date:** 2026-05-15  
**Status:** Approved by user  

---

## Overview

A pioneering, encyclopedic tutorial website explaining exactly how the web works — from the moment a user types a URL to the final composited pixel on screen. Dark-themed, visually-first, WebGL-powered, SEO-optimised, and built to be the single best resource on the internet for this topic.

Source material: `~/Downloads/web_internals_visual_deep_dive.html` — 16 concepts across 5 phases (Network, Browser, Render, Execute, Optimize).

---

## Tech Stack

| Concern | Choice | Reason |
|---|---|---|
| Framework | Next.js 15 (App Router, Turbopack) | SSR/SSG for SEO, same as koka-lab |
| Language | TypeScript | Type safety throughout |
| Styling | Tailwind CSS v4 | Utility-first, zero-runtime |
| 3D / WebGL | Three.js + @react-three/fiber + @react-three/drei | Consistent with koka-lab |
| Animations | Framer Motion | Scroll-driven reveals, page transitions |
| Fonts | Geist Sans (headings), Inter (body), JetBrains Mono (code) | Sharp, technical aesthetic |

---

## Color System

```
Background:    #08080F  (near-black, deep space)
Surface:       #0F0F1A  (card/panel)
Border:        #1A1A2E  (subtle grid lines)

Phase colors (neon on dark):
  Network  →  Cyan     #00D4FF  / bg #001A20
  Browser  →  Blue     #4D9FFF  / bg #00101F
  Render   →  Amber    #FFB340  / bg #1F1200
  Execute  →  Rose     #FF4D6D  / bg #1F000A
  Optimize →  Emerald  #00E5A0  / bg #001F12

Text primary:  #F0F0FF
Text muted:    #6B7280
Code bg:       #0D0D1A
```

---

## Site Structure

```
/                          → Landing page (hero WebGL + overview)
/[slug]                    → Topic pages (16 total, dynamic route)
  /url-parsing
  /dns-resolution
  /tcp-connection
  /tls-handshake
  /http-protocol
  /html-parsing
  /css-parsing
  /render-tree
  /layout-reflow
  /paint
  /compositing
  /javascript-engine
  /event-loop
  /http-caching
  /cdn-edge
  /service-workers
/sitemap.xml               → Auto-generated
/robots.txt                → Static
```

---

## Page Architecture

### Landing Page (`/`)

1. **Hero section** — Full-screen WebGL scene: an animated network packet travelling the full 16-step pipeline (tiny glowing sphere moving through a stylised diagram). Text overlay: *"Every URL. Every pixel. Explained."*
2. **Phase grid** — 5 phase cards (Network → Browser → Render → Execute → Optimize) with animated phase icon and count
3. **Concept cards** — 16 cards in a masonry/grid layout, each with phase colour, number, title, and 1-line teaser
4. **"How to use"** strip — 3-column explainer: Read → Interact → Master

### Topic Pages (`/[slug]`)

Layout: **full-width canvas hero** top, then **2-col below** (main content left, sticky sidebar right on desktop). On mobile: single column.

Sections per page:
1. **Phase badge + title + subtitle** (hero area, always visible)
2. **WebGL scene** — full-width, 300–500px tall, concept-specific animation (see WebGL catalogue below). Plays on scroll-into-view. Has a "pause/play" toggle.
3. **The Concept** — Rich prose explanation (from `ex` field), beautifully typeset
4. **Interactive Diagram** — The SVG diagrams from the HTML file, upgraded: dark-themed, animated on mount with Framer Motion (each element fades/slides in)
5. **Key Facts** — Card grid (from `facts` array), each with a monospace value and sans label
6. **Engineer's Insight** — Highlighted callout block (from `insight` field) with a distinct visual treatment (left border, subtle glow)
7. **Code Demo** — If the topic has a code example (layout thrashing, compositing, etc.), an interactive two-panel demo: bad code left, good code right, with a "Run" button that shows a simulated performance outcome
8. **Navigation** — Previous / Next topic pills at the bottom

### Shared Layout

- **Top nav**: Logo + "Web Internals", phase filter pills, GitHub link
- **Left sidebar** (desktop): All 16 topics grouped by phase, current topic highlighted, progress bar showing how many visited
- **Progress persistence**: `localStorage` tracks visited topics

---

## WebGL Scene Catalogue

Each scene uses Three.js rendered via @react-three/fiber. All scenes are dark, use glowing particle/line aesthetics.

| Topic | Scene description |
|---|---|
| URL parsing | Animated URL string that splits into colour-coded segments (scheme, host, path, query, fragment) that fly apart into labelled nodes |
| DNS resolution | 5-node chain (Browser→OS→Recursive→Root/TLD→Auth NS); green "answer" packet flows backward on cache hit, red on miss |
| TCP connection | Client-server vertical lines with SYN/SYN-ACK/ACK packets as glowing dots moving between them; timing annotations appear |
| TLS handshake | Same structure as TCP; ClientHello/ServerHello with a lock icon that "clicks closed" on session key derivation |
| HTTP protocol | Request object (glowing box) travels right to server, response travels back; headers animate in as text layers |
| HTML parsing | Characters stream in from left → tokenizer box → DOM tree grows node-by-node on right |
| CSS parsing | 3 competing rules converge; specificity bars fill up; winning rule glows and applies to a preview element |
| Render tree | DOM tree + CSSOM tree side-by-side; `display:none` node glows red then disappears; merged Render tree assembles on right |
| Layout (reflow) | Box model layers (content→padding→border→margin) expand outward; FSL bad pattern shows red flashes vs. green batched |
| Paint | Render node → display list commands stream out → tiles rasterize on GPU grid |
| Compositing | 3 GPU layers at different Z depths; layer 2 slides (compositor only, no repaint flash); layer 1 repaints in red flash |
| V8 engine | Source → AST → Ignition bytecode → TurboFan machine code pipeline; "hot!" indicator flashes; deopt path glows red |
| Event loop | Rotating ring: macrotask queue → microtask drain (drains fully before render) → rAF → Render. Tasks animate through |
| HTTP caching | Decision flowchart nodes light up in sequence; green path (304) vs. red path (full fetch) |
| CDN & edge | Globe with PoP nodes; user location pulses; nearest PoP connects with short line vs. long line to origin |
| Service workers | Lifecycle state machine; register→install→waiting→activate→active; fetch intercept arrow animates |

---

## SEO Strategy

- `generateMetadata()` per page with title, description, canonical URL, OpenGraph image
- JSON-LD `TechArticle` schema on each topic page
- JSON-LD `WebSite` + `ItemList` on the home page
- `sitemap.xml` generated via `next-sitemap` or app router's `sitemap.ts`
- `robots.txt` allowing full crawl
- Semantic HTML: `<article>`, `<section>`, `<h1>`/`<h2>` hierarchy, `<time>`, `<code>`, `<pre>`
- Open Graph images: dynamic via `next/og` (ImageResponse) — dark card with topic title, phase badge, and a miniature SVG diagram

---

## Data Layer

All 16 topics stored as a typed TypeScript array in `src/data/topics.ts`:

```ts
export interface Topic {
  id: string           // slug
  phase: Phase         // 'Network' | 'Browser' | 'Render' | 'Execute' | 'Optimize'
  order: number        // 1–16
  title: string
  subtitle: string
  example: string      // prose explanation
  facts: [string, string][]  // [label, value] pairs
  insight: string
  diagramKey: string   // maps to SVG component
  sceneKey: string     // maps to WebGL scene component
  seoDescription: string
}
```

---

## File Structure

```
web-internals/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← root layout, fonts, metadata
│   │   ├── page.tsx            ← landing page
│   │   ├── [slug]/
│   │   │   ├── page.tsx        ← topic page
│   │   │   └── opengraph-image.tsx ← dynamic OG image
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopNav.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── topic/
│   │   │   ├── TopicHero.tsx
│   │   │   ├── ConceptSection.tsx
│   │   │   ├── FactsGrid.tsx
│   │   │   ├── InsightCallout.tsx
│   │   │   ├── CodeDemo.tsx
│   │   │   └── TopicNav.tsx
│   │   ├── diagrams/
│   │   │   └── [DiagramKey].tsx  ← one per topic (Framer Motion SVG)
│   │   ├── scenes/
│   │   │   └── [SceneKey].tsx    ← one WebGL scene per topic
│   │   └── home/
│   │       ├── HeroScene.tsx     ← full-pipeline animation
│   │       ├── PhaseGrid.tsx
│   │       └── ConceptCards.tsx
│   ├── data/
│   │   └── topics.ts
│   ├── hooks/
│   │   ├── useProgress.ts
│   │   └── useInView.ts
│   └── lib/
│       ├── phaseColors.ts
│       └── schema.ts           ← JSON-LD generators
├── public/
│   └── fonts/                  ← self-hosted Geist + JetBrains Mono
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## Non-Goals

- No user accounts / authentication
- No backend / database
- No comments / community features
- No video embeds (WebGL replaces video)
- No dark/light mode toggle (dark only, by design)

---

## Success Criteria

- Lighthouse score ≥ 95 on all four metrics
- All 16 topics rendered as static pages (SSG)
- Every topic has a running WebGL scene
- No layout shift (CLS = 0) from font loading
- `<title>` and `<meta description>` unique per page
- Passes Core Web Vitals on mobile
