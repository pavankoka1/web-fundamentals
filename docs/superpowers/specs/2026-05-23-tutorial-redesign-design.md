# Tutorial Redesign — web-internals

**Date:** 2026-05-23
**Scope:** web-internals project only (sibling sites untouched)
**Direction:** D — Quiet Editorial Precision
**Mental model:** The URL → pixels journey, in 7 sequential steps
**Status:** Design (pre-implementation)

---

## 1. Goal

Transform `web-internals` from a 17-concept, 5-phase tutorial into a coherent **7-step linear journey** from the moment the user enters a URL to the moment pixels appear on screen.

Three intertwined changes:

1. **Restructure** — replace the 5-phase taxonomy (Network / Browser / Render / Execute / Optimize) with 7 sequential steps. Every concept fits the linear narrative.
2. **Visual refresh** — apply Direction D (Quiet Editorial Precision). New typography, single ice-cyan accent, KOKA brand mark, gradient hairlines, generous whitespace.
3. **Depth port** — bring ~11 new concepts in from sibling sites (`how-browsers-render`, `web-fundamentals`), enrich the existing 17 with deeper theory.

Topics that don't fit the linear journey (invalidation, runtime, interaction, JS language internals) are explicitly **out of scope** — captured in `docs/future-runtime-tutorial-topics.md` as the seed for a sibling site ("Beyond the First Frame").

---

## 2. Mental model

The tutorial answers a single question: **what happens between the user pressing Enter and pixels appearing?**

Every concept passes this test:
- Does it happen during the first paint?
- Does the journey not work without it?

If both answers are yes, it belongs. If either is no, it lives in the sibling tutorial.

The user is reading a coherent narrative — not a reference, not a glossary. Each step builds on the previous. The hero (Step 0) shows the whole pipeline as one picture; each step is a deep dive into one slice.

---

## 3. Information architecture

### 3.1 Step taxonomy

| Step | Title | Arrow | Concepts |
|------|-------|-------|----------|
| 0 | Pipeline overview | _prologue_ | 1 |
| 1 | Network & transport | address → server | 10 |
| 2 | Parsing | bytes → document | 3 |
| 3 | Style & tree construction | document → render tree | 3 |
| 4 | Layout | render tree → geometry | 2 |
| 5 | Paint | geometry → draw commands | 4 |
| 6 | Compositing | draw commands → layers | 4 |
| 7 | Display | layers → pixels | 2 |

**Total: 29 concepts** (1 overview + 28 step concepts). Up from 17.

### 3.2 Concept list per step

#### Step 0 — Pipeline overview (new)
- `00.0` Pipeline overview — the journey in one picture

#### Step 1 — Network & transport (10)
- `01.1` URL Parsing (keep)
- `01.2` Service Workers — intercept (keep, enrich)
- `01.3` DNS Resolution (keep)
- `01.4` TCP Connection (keep)
- `01.5` TLS Handshake (keep)
- `01.6` HTTP Request (keep)
- `01.7` HTTP Caching (keep)
- `01.8` CDN / Edge (keep)
- `01.9` Resource Hints — preload / prefetch / preconnect / dns-prefetch (new, from `wf`)
- `01.10` Resource Loading & Priorities — defer, async, code splitting (new, from `wf`)

#### Step 2 — Parsing (3)
- `02.1` HTML Parsing → DOM (keep)
- `02.2` CSS Parsing → CSSOM (enrich, from `hbr`)
- `02.3` Scripts during parsing — defer/async/V8 entry (new, authored from `wf` CRP content)

#### Step 3 — Style & tree construction (3)
- `03.1` Style Recalculation — specificity, cascade, computed style (new, from `hbr`)
- `03.2` Render Tree (keep, enrich)
- `03.3` Layout Tree Construction — LayoutObject, display:none filtering (new, from `hbr`)

#### Step 4 — Layout (2)
- `04.1` Layout / Reflow — two-pass algorithm, fragment tree (keep, enrich from `hbr`)
- `04.2` Containment — `contain` modes, content-visibility (new, from `hbr`)

#### Step 5 — Paint (4)
- `05.1` Paint Records & Display Lists — cc::DisplayItemList (keep, enrich from `hbr`)
- `05.2` Stacking Contexts — triggers, z-order, opacity surprise (new, from `hbr`)
- `05.3` Property Trees & Pre-paint — cc::PropertyTree, Transform/Clip/Effect (new, from `hbr`)
- `05.4` Paint pipeline summary (existing "Paint" reframed)

#### Step 6 — Compositing (4)
- `06.1` Layer Promotion — explicit (`will-change`) vs implicit (new, from `hbr`)
- `06.2` Compositor Thread & Commit — main-to-cc handoff, cc::LayerTreeHost (new, from `hbr`)
- `06.3` Tiling & Rasterization — 256×256 tiles, Skia, GPU workers (new, from `hbr`)
- `06.4` Compositing — quads, Viz aggregation, GPU calls (keep, enrich from `hbr`)

#### Step 7 — Display (2)
- `07.1` VSync & Display Pipeline — 60Hz/120Hz, frame timing (new, from `hbr`)
- `07.2` Frame Budget — the punctuation, INP linkage (keep, enrich from `hbr`)

### 3.3 Mapping from current 17 concepts

| Current concept | New location | Treatment |
|-----------------|--------------|-----------|
| URL Parsing | 01.1 | keep |
| DNS Resolution | 01.3 | keep |
| TCP Connection | 01.4 | keep |
| TLS Handshake | 01.5 | keep |
| HTTP Request | 01.6 | keep |
| HTTP Caching | 01.7 | keep |
| CDN / Edge | 01.8 | keep |
| Service Workers | 01.2 | keep, enrich |
| HTML Parsing | 02.1 | keep |
| CSS Parsing | 02.2 | rename → CSS Parsing → CSSOM, enrich |
| V8 Engine | 02.3 | fold into new "Scripts during parsing" (deep V8 deferred to sibling) |
| Event Loop | 02.3 | fold into 02.3 (deep event loop deferred to sibling) |
| Render Tree | 03.2 | keep, enrich |
| Layout | 04.1 | keep, enrich |
| Paint | 05.4 | reframe as "Paint pipeline summary" — full step is now 4 concepts |
| Compositing | 06.4 | keep, enrich |
| Frame Budget / Jank | 07.2 | keep frame budget; **jank framing dropped** (deferred to sibling tutorial) |

**Net:** 14 concepts kept 1:1, 2 folded into one new concept (`02.3`), 1 reframed and joined by 3 new concepts in same step (Step 5), 1 jank framing dropped. Plus 11 brand-new concepts and 1 pipeline overview = **29 total**.

### 3.4 Routing

**New URL pattern:**
```
/                              → home (pipeline overview hero + step grid)
/steps/01-network              → Step 1 landing
/steps/01-network/url-parsing  → individual concept
/steps/02-parsing/html         → individual concept
…
/journey                       → reading mode (linear scroll through all concepts)
```

**Redirects (Next.js middleware or next.config.ts):**
```
/url-parsing       → /steps/01-network/url-parsing  (301)
/dns-resolution    → /steps/01-network/dns-resolution
… one per current concept …
```

### 3.5 Concept data shape

Extend `src/data/topics.ts` (rename `concepts.ts`):

```ts
type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

interface Concept {
  id: string;                  // slug, e.g. "url-parsing"
  step: Step;                  // 1-7 (or 0 for overview)
  order: number;               // position within step (1-indexed)
  globalOrder: number;         // position across whole journey (1-28)
  title: string;
  arrow: string;               // e.g. "address → server" — shown in eyebrow context
  subtitle: string;            // one-line lede
  hook: string;                // 2-3 sentence prose hook for cards
  body: string;                // long-form prose (markdown)
  facts: Array<[string, string]>;
  insight?: string;
  codeDemo?: { bad: string; good: string; label: string };
  sceneKey: string;            // identifier for 3D/canvas scene
  diagramKey?: string;         // identifier for diagram
  source: "original" | "hbr" | "wf";  // attribution
  newConcept?: boolean;        // for "new in this redesign" badge
}
```

---

## 4. Visual identity — Direction D

**Quiet Editorial Precision.** Built for "neat / clean / polished / elegant".

### 4.1 Principles

1. **Whitespace over color.** Hierarchy from size, weight, and space — not saturated tones.
2. **One accent.** Ice cyan, used sparingly: links, demo CTAs, progress, the KOKA mark.
3. **3D carries the showpiece.** UI stays out of the way; per-concept scenes do the visual lifting.
4. **Hairline gradient rules.** Hard dividers retire; gradient hairlines fade left-to-right.
5. **Restrained motion in UI.** Micro-interactions, gentle entrance reveals. Big motion is reserved for scenes and the KOKA mark.
6. **Single accent across all steps.** The 5 saturated phase colors retire; phases become numbered steps.

### 4.2 References

Stripe Press · ciechanow.ski · Vercel docs · Anthropic site · Linear changelog. Quiet authority over visual noise.

---

## 5. Typography

### 5.1 Stack

| Role | Font | Weight | Source |
|------|------|--------|--------|
| Display (titles) | Source Serif 4 | 400 | next/font (Google) |
| Body | Geist Sans | 400 / 500 | `geist` package |
| Mono / eyebrows / code | Geist Mono | 400 / 500 | `geist` package |

**Why Source Serif 4 specifically:** modern serif, designed for screens, calm authority, pairs with sans/mono without flourish. No italic for headlines (italic feels editorial-magazine; we want editorial-book).

### 5.2 Type ladder

```css
/* Display */
--type-hero:      clamp(40px, 5vw, 64px);   /* journey overview hero */
--type-title:     clamp(36px, 4vw, 52px);   /* concept page title (Source Serif 4) */
--type-section:   clamp(22px, 2vw, 28px);   /* in-page section heads (Source Serif 4) */

/* Body */
--type-lede:      18px;     /* opener paragraph (Geist Sans) */
--type-body:      16px;     /* default prose (Geist Sans) */
--type-small:     14px;     /* secondary, captions (Geist Sans) */
--type-caption:   12.5px;   /* fine print (Geist Sans) */

/* Eyebrow / mono */
--type-eyebrow:   11px;     /* uppercase mono, 0.22em tracking (Geist Mono) */
--type-label:     10px;     /* uppercase mono, 0.3em tracking (Geist Mono) */
--type-tag:       9px;      /* uppercase mono, 0.16em tracking (Geist Mono) */
```

### 5.3 Line height & measure

- Body line-height: `1.65`
- Lede line-height: `1.55`
- Title line-height: `1.05`
- Body measure: max-width ~62ch (single column long-form)

### 5.4 Font loading

`Source Serif 4` via `next/font/google` with `display: 'swap'`, subset `'latin'`, weights `[400, 500]`. Single woff2 file. Estimated cost: ~30 KB.

Geist already loaded — no change.

---

## 6. Color system

### 6.1 New tokens (replace current in `src/app/globals.css`)

```css
@theme {
  /* Surface */
  --color-bg:           #08080F;
  --color-surface:      #0C0C12;
  --color-surface-2:    #12121A;
  --color-border:       rgba(255, 255, 255, 0.08);
  --color-border-bright: rgba(125, 211, 252, 0.35);

  /* Text */
  --color-text-primary:   #F4F4F8;
  --color-text-secondary: rgba(244, 244, 248, 0.72);
  --color-text-muted:     rgba(244, 244, 248, 0.45);
  --color-text-dim:       rgba(244, 244, 248, 0.32);

  /* Accent — single ice cyan */
  --color-accent:         #7DD3FC;
  --color-accent-soft:    rgba(125, 211, 252, 0.06);
  --color-accent-line:    rgba(125, 211, 252, 0.35);
  --color-accent-glow:    rgba(125, 211, 252, 0.18);

  /* Negative (errors, bad-code samples) */
  --color-negative:       #FF6B6B;
  --color-negative-soft:  rgba(255, 107, 107, 0.06);

  /* Type */
  --font-display:  'Source Serif 4', Georgia, serif;
  --font-sans:     var(--font-geist-sans);
  --font-mono:     var(--font-geist-mono);
}
```

### 6.2 Retired tokens

The following are removed:

- `--color-phase-network` (cyan #00D4FF)
- `--color-phase-browser` (blue #4D9FFF)
- `--color-phase-render` (orange #FFB340)
- `--color-phase-execute` (pink #FF4D6D)
- `--color-phase-optimize` (green #00E5A0)
- `phaseColor()` helper and all its variants

All component code that references `phaseColor(topic.phase)` is replaced with the single accent token. Step distinction comes from numbering and content, not color.

### 6.3 Selection & focus

```css
::selection { background: var(--color-accent-soft); color: var(--color-text-primary); }
:focus-visible { outline: 1px solid var(--color-accent); outline-offset: 2px; }
```

### 6.4 Scrollbar

Stays minimal — 6px track, accent thumb on hover.

---

## 7. KOKA brand mark

### 7.1 Source

Lifted from `web-fundamentals/src/components/KokaAnimation/KokaAnimation.tsx`. Self-contained Framer Motion component, no external assets.

### 7.2 Modifications

- **Color:** retint from `--accent-teal` to `--color-accent` (`#7DD3FC`).
- **Position:** top-center (not top-left as in source). `position: fixed; top: 24px; left: 50%; transform: translateX(-50%)`.
- **Behavior:** hero → mini on scroll (Decision 01-C).
- **Loop:** 4-second total cycle (draw 1.5s → hold 1s → undraw 1s → pause 0.5s), staggered by 100ms per path.

### 7.3 Sizing states

| State | Width | Height | Opacity | Drop-shadow |
|-------|-------|--------|---------|-------------|
| Hero (scroll < 64px) | 144px | 48px | 1.0 | `0 0 16px var(--color-accent-glow)` |
| Mini (scroll ≥ 64px) | 72px | 24px | 0.85 | `0 0 8px var(--color-accent-glow)` |

Transition between states: `300ms ease-out` on width / height / opacity. Driven by `useScroll` from Framer Motion.

### 7.4 Loop variants

```ts
const pathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: [0, 1, 1, 0],
    opacity: [0, 1, 1, 0],
    transition: {
      duration: 4,
      ease: [0.65, 0, 0.35, 1],   // custom cubic-bezier
      delay: i * 0.1,
      times: [0, 0.375, 0.625, 1],
      repeat: Infinity,
      repeatDelay: 0.5,
    },
  }),
};
```

### 7.5 Accessibility

- `aria-hidden="true"` — decorative.
- `prefers-reduced-motion`: replace draw-in animation with static visible state; opacity stays 0.85.

### 7.6 File location

`src/components/brand/KokaMark.tsx`. New `brand/` directory under `components/`.

---

## 8. Layout system

### 8.1 Page chrome

```
┌──────────────────────────────────────────┐
│              [KOKA mark]                 │  ← top-center, fixed
│                                          │
│  ┌──┐                                    │
│  │•│                                     │
│  │○│                                     │
│  │○│     ┌───── concept page ─────┐      │
│  │○│     │                        │      │
│  │○│     │  eyebrow               │      │
│  │○│     │  Title                 │      │
│  │○│     │  Lede paragraph        │      │
│  │○│     │                        │      │
│  └──┘    │  Body content...       │      │
│  step    │                        │      │
│  rail    │  Demo card             │      │
│ (left)   │                        │      │
│          │  TopicNav (prev/next)  │      │
│          └────────────────────────┘      │
│                                          │
│  ──────── progress hairline ─────        │  ← bottom, scroll-driven
└──────────────────────────────────────────┘
```

### 8.2 Step rail (left)

- Position: `fixed; left: 32px; top: 50%; transform: translateY(-50%)`.
- 7 dots, vertically stacked, 16px gap.
- Each dot: 8px circle, border `1px solid var(--color-text-dim)`, no fill.
- Active step: fill = `var(--color-accent)`, subtle pulse (`opacity 0.85 ↔ 1.0`, 2s cycle).
- Visited steps: fill = `var(--color-text-muted)`, no pulse.
- Hover: dot scales `1.4x`, label slides in to the right showing `"Step 03 — Style"`.
- Hidden on mobile (`< 768px`); replaced by top-of-page mini stepper.

### 8.3 Concept page layout

- Single column.
- Max width: `680px` for prose, `840px` for hero/demo blocks.
- Centered horizontally.
- Vertical rhythm: `--space-section: 48px; --space-block: 24px; --space-paragraph: 16px`.

### 8.4 Step landing page

Each `/steps/0X-name` shows:
- Step number + arrow + title (Source Serif 4)
- Step lede (~3 sentences)
- Hairline rule
- List of concepts in the step (numbered, click to enter)
- "Continue to Step N+1" call-to-action

### 8.5 Journey overview (home)

Currently `src/app/page.tsx` renders the HeroScene + concept grid. Replaces with:
- KOKA mark animation (full hero size, ~250ms entrance)
- Editorial title: "From URL to pixels. In seven steps."
- Lede
- Hairline
- 7 step cards (vertical stack, single column, hairline between)
- Each card: step number, arrow, title, 2-line description, "begin" link
- Pipeline overview animation below (refactored HeroScene)

### 8.6 Journey read mode

New route: `/journey`. All 28 concepts concatenated into a single scrollable document with reading-mode chrome (no rail, just scroll-driven progress hairline + reading time estimate at top). Designed for an evening of immersive reading.

---

## 9. Component shells (refactor)

### 9.1 Existing components — refactored

- **`TopicHero.tsx`** → **`ConceptHero.tsx`**: drops phase badge / phase color. Adds eyebrow (`{step} · {step name} · {arrow}`), `globalOrder` indicator (`12 / 28`), Source Serif 4 title.
- **`ConceptSection.tsx`**: refined section heading uses Source Serif 4. Code blocks switch from cyan accent to single ice cyan.
- **`FactsGrid.tsx`**: cards lose phase color; gain accent dot in ice cyan, refined hairline borders.
- **`InsightCallout.tsx`**: keeps callout treatment. Border-left switches to ice cyan. Radial glow desaturates.
- **`CodeDemo.tsx`**: bad/good toggle keeps red/cyan distinction. Bad = `--color-negative`, good = `--color-accent`. Mono treatment refined.
- **`TopicNav.tsx`** → **`ConceptNav.tsx`**: prev/next cards include step + arrow + title; lose phase color.
- **`Sidebar.tsx`** → **`StepRail.tsx`**: complete rewrite (see 8.2).

### 9.2 New components

- **`KokaMark.tsx`** (`src/components/brand/`) — see Section 7.
- **`JourneyOverview.tsx`** (`src/components/home/`) — replaces home `HeroScene` usage.
- **`StepLanding.tsx`** (`src/components/step/`) — renders step landing pages.
- **`PipelineOverview.tsx`** (`src/components/scenes/`) — refactor of current HeroScene, scrubbable.
- **`GradientRule.tsx`** — reusable hairline with entrance animation.
- **`ProgressHairline.tsx`** — bottom-of-page scroll-driven indicator.
- **`StepBadge.tsx`** — small step indicator for cards / nav.
- **`ConceptCard.tsx`** — card used in step landing pages and journey overview.

### 9.3 Motion primitives — new file

`src/lib/motion.ts` — shared Framer Motion variants and easing. Replaces inline declarations scattered across components.

```ts
export const ease = {
  out:    [0.16, 1, 0.3, 1],          // softest, default for entrances
  inOut:  [0.65, 0, 0.35, 1],         // for shared transitions
  inBack: [0.5, -0.5, 0.5, 1.5],     // slight overshoot, for emphasis
};

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: ease.out } },
};

export const stagger = (gap = 0.08) => ({
  visible: { transition: { staggerChildren: gap } },
});

export const drawRule = {
  hidden: { scaleX: 0, transformOrigin: "left" },
  visible: { scaleX: 1, transition: { duration: 0.8, ease: ease.out } },
};

// … plus heroEntrance, miniMark, demoReveal, railDotFill, pageTransition …
```

---

## 10. Animation system

### 10.1 Philosophy

Restraint with purpose. UI motion exists to communicate state changes and reward attention — never to perform. Three-second loops are loops, not events. Big motion is reserved for two surfaces: the 3D scenes and the KOKA mark.

### 10.2 Easing palette

| Name | Curve | Use |
|------|-------|-----|
| `ease.out` | `cubic-bezier(0.16, 1, 0.3, 1)` | Default entrance, fades, slides |
| `ease.inOut` | `cubic-bezier(0.65, 0, 0.35, 1)` | Shared transitions, KOKA loop |
| `ease.inBack` | `cubic-bezier(0.5, -0.5, 0.5, 1.5)` | Subtle overshoot for emphasis |

### 10.3 Polish targets (10 surfaces)

1. **KOKA mark hero → mini** — scroll-driven scale + opacity (Section 7.3).
2. **Page entrance choreography** — KOKA finishes draw → eyebrow fades in (80ms) → title fades + slides up 12px (180ms) → lede fades (240ms) → demo card scales from 0.98 (320ms). Total reveal: ~0.5s.
3. **Page-to-page transition** — `motion.div` with `AnimatePresence` and `mode="wait"`. Exit: opacity → 0, y → -8px (160ms ease.in). Enter: from opacity 0, y 12px → 0 (240ms ease.out). Progress hairline advances independent of page swap.
4. **Gradient hairline reveal** — `drawRule` variant (Section 9.3). 800ms scaleX from 0 to 1.
5. **Demo card "open"** — hover: border brightens, accent CTA glows softly (`box-shadow` transition 200ms). Click: scale `0.985 → 1` with `inBack`, expand content reveal.
6. **Step rail dot interactions** — active dot pulse (`opacity 0.85 ↔ 1.0`, 2s linear loop), hover scale `1 → 1.4` (200ms ease.out), label slide-in.
7. **Scroll-driven progress hairline** — bottom-of-page 1px line, `--color-accent-line`, width tied to `scrollYProgress` via `useScroll`. Updates without re-render.
8. **3D scene entrance from blur** — scene mounts with `filter: blur(8px); opacity: 0`, transitions to `blur(0); opacity: 1` over 400ms after first frame.
9. **Numbered eyebrow scrub** — when step changes, the `12 / 28` counter cycles digits like a flip board (Framer Motion `key` + variant). 300ms.
10. **Reduced-motion fallbacks** — every primitive checks `useReducedMotion()`. If true: all entrance animations become instant; KOKA mark is static; scene blur disabled; rail pulse disabled; transitions become opacity-only at 100ms.

### 10.4 Per-scene polish

The 16 existing scenes (8 Canvas 2D + 8 R3F) keep their internal animation loops. They gain:

- **Entrance from blur** (Polish target #8).
- **Consistent SceneStage wrapper** — new component that normalizes mount/unmount, lighting position (for R3F), camera fov, padding, intersection observer for pausing offscreen scenes.
- **Pause when offscreen** — `IntersectionObserver` halts rAF loops outside viewport.
- **Loading skeleton** — refined empty state during lazy load (subtle hairline grid + ice cyan progress dot).

### 10.5 Performance budget

- Page entrance ≤ 600ms to interactive.
- Step transition ≤ 400ms.
- KOKA mini-mark uses `transform` only (no layout / paint).
- Rail interactions use `transform` / `opacity` only.
- No animated `width`, `height`, `top`, `margin` in UI motion.

---

## 11. Content port plan

### 11.1 Sources

- **`hbr`** = `how-browsers-render` — primary source for Render, Compositing, Display deep content.
- **`wf`** = `web-fundamentals` — primary source for Resource Hints, Resource Loading, CRP framings.
- **`std`** = standard references / authored fresh — only when neither source covers a topic adequately.

### 11.2 Port strategy

For each new concept:
1. Capture theory verbatim from source where excellent (already done — see deep-read transcripts).
2. Reframe in `web-internals` voice: explanatory but not chatty, technical but not jargon-heavy.
3. Strip source-specific framings ("In our blast-radius meter…") and replace with neutral teaching.
4. Build a **new scene** in `web-internals` Direction D style — do not lift demos from sibling sites verbatim (different design language, different React patterns).
5. Author 4-6 facts per concept (the FactsGrid data).
6. Author an Engineer's Insight (1-2 sentence punchline).
7. Author a CodeDemo if applicable (bad/good pattern).

### 11.3 Concepts requiring fresh authoring

These had no direct source content and must be authored:

- `02.3` Scripts during parsing (synthesize from `wf` CRP + standard refs)
- `00.0` Pipeline overview (synthesize from `hbr` glossary + own framing)

### 11.4 Existing concepts — enrichment

For the 17 existing concepts, the deep body content stays. Enrichment adds:
- Better facts (cross-reference `wf`/`hbr` numbers and framings)
- Engineer's Insight refresh
- Connection to neighboring steps ("This sits between Step N-1 and Step N+1" framing)
- Updated scene per Direction D treatment

---

## 12. Migration plan

### 12.1 Build sequence

**Phase A — Foundation** (~3-5 days)
- A1. Install `Source Serif 4` via `next/font`.
- A2. Replace tokens in `globals.css` (Section 6.1).
- A3. Build `KokaMark.tsx` (Section 7).
- A4. Build `src/lib/motion.ts` (Section 9.3).
- A5. Build `GradientRule.tsx`, `ProgressHairline.tsx`, `StepBadge.tsx`.
- A6. Visual smoke test on existing home + one concept page.

**Phase B — Layout shells** (~3-5 days)
- B1. `StepRail.tsx` (replaces `Sidebar.tsx`).
- B2. App shell layout updates (`src/app/layout.tsx`).
- B3. Page transition wrapper (`AnimatePresence` mode="wait").
- B4. Concept page template using new shells.

**Phase C — Restructure routing** (~2 days)
- C1. Migrate concept data to new shape (Section 3.5).
- C2. New route structure (`/steps/[step]/[concept]`).
- C3. Redirect map for old URLs (next.config.ts).
- C4. Update `generateStaticParams()`.
- C5. New step landing pages.

**Phase D — Existing concept refactor** (~4-6 days)
- D1. Refactor 6 topic components (`ConceptHero`, `ConceptSection`, `FactsGrid`, `InsightCallout`, `CodeDemo`, `ConceptNav`).
- D2. Apply new design to all 17 existing concepts.
- D3. Author refreshed Engineer's Insights.
- D4. Verify all 16 existing scenes render under new shell.

**Phase E — Content port** (~8-12 days)
- E1. Author 11 new concept entries (data + body).
- E2. Build 11 new scenes (mix of Canvas 2D and R3F, matched to topic).
- E3. Author 1 new pipeline overview scene (refactor of current HeroScene).

**Phase F — Animation polish** (~4-6 days)
- F1. Wire page transitions.
- F2. Wire scroll-driven progress hairline.
- F3. Wire KOKA hero → mini scroll behavior.
- F4. Wire gradient rule reveals.
- F5. Wire step rail interactions.
- F6. Implement reduced-motion paths.
- F7. Implement scene entrance-from-blur + offscreen-pause.

**Phase G — Polish & launch** (~3-5 days)
- G1. Lighthouse pass (performance budget Section 10.5).
- G2. Accessibility pass (focus order, keyboard nav, reduced motion, screen reader).
- G3. Cross-browser test (Chrome, Firefox, Safari, mobile Safari, mobile Chrome).
- G4. Final design review.

**Estimated total:** 4-6 focused weeks.

### 12.2 Backward compatibility

- All current concept URLs (e.g. `/url-parsing`) → 301 redirect to new path.
- `localStorage` key `wi-visited` is preserved; concept IDs unchanged.
- Sitemap regenerated; RSS (if any) regenerated.

---

## 13. Out of scope

Explicitly **not** part of this redesign:

- Runtime topics (invalidation, thrashing, hit testing, INP, etc.) — captured in `docs/future-runtime-tutorial-topics.md` for sibling site.
- Authentication, accounts, progress sync across devices.
- Search / filter UI (the 7-step rail + concept lists are the discovery mechanism).
- Comments / community features.
- Mobile-app version. (Responsive web only.)
- Theme switcher / light mode (dark-only ships first; light mode is future work).
- Code playgrounds beyond the existing CodeDemo bad/good pattern.
- Internationalization.
- Sibling site implementation ("Beyond the First Frame" is its own future project).

---

## 14. Open questions

These are minor and can be settled during implementation:

1. **Journey read mode (`/journey`)** — ship in v1, or defer? *Default: defer, ship after main launch.*
2. **Step landing page CTAs** — single "begin" link, or list each concept individually? *Default: list each concept with a "begin Step N" primary at the bottom.*
3. **Mobile step rail** — replace left rail with sticky top mini-bar (numbered dots horizontal)? *Default: yes, top-of-page mini-stepper.*
4. **Source Serif 4 weight** — 400 only, or pair with 500/600 for emphasis? *Default: 400 only; emphasis via size.*
5. **Pipeline overview scene** — full-canvas hero, or contained within a card? *Default: contained within a card on home; full-canvas only on `/steps/00-overview`.*

---

## 15. Success criteria

The redesign succeeds when:

- A first-time visitor reads the home and grasps the seven-step shape of the journey in under 30 seconds.
- A reader can move from "URL Parsing" to "Display" sequentially without losing context or feeling URL/section discontinuity.
- All 28 concepts share one coherent visual identity — type, accent, motion all single-system.
- Lighthouse Performance ≥ 95 on a fresh-load concept page.
- `prefers-reduced-motion` users get a fully usable experience with no entrance choreography.
- Power readers can navigate by keyboard alone (tab through rail, arrow keys to step prev/next).

---

## 16. References

- `docs/future-runtime-tutorial-topics.md` — sibling tutorial spec (cut content).
- `how-browsers-render` source code — content reference.
- `web-fundamentals` source code — content + KOKA animation reference.
- `web-fundamentals/src/components/KokaAnimation/KokaAnimation.tsx` — KOKA mark base implementation.
- Stripe Press, ciechanow.ski, Vercel docs — design references.
- Deep-read transcripts (in conversation history) — verbatim source content.

---

_End of design._
