# Tutorial Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform web-internals into a 7-step linear URL→pixels tutorial with Direction D visual identity, KOKA brand mark, and 11 new concepts ported from sibling sites.

**Architecture:** Refactor `src/data/topics.ts` → new concept shape with `step`/`globalOrder`. Replace `src/components/layout/Sidebar.tsx` with `StepRail`. Drop `phaseColor()` everywhere, replace with single ice-cyan accent. New `src/components/brand/KokaMark.tsx`. New routes `/steps/[step]/[concept]` with 301 redirects from old slugs. New `src/lib/motion.ts` shared variants.

**Tech Stack:** Next.js 15 (App Router, Turbopack), React 19, Tailwind 4, Framer Motion 12, Three.js / R3F, next/font for Source Serif 4, Geist for sans/mono. **No test runner installed** — verification via TypeScript compile (`npx tsc --noEmit`), `npm run build`, and dev server visual smoke test.

**Reference spec:** `docs/superpowers/specs/2026-05-23-tutorial-redesign-design.md`

---

## File Structure Overview

### Created files
```
src/components/brand/KokaMark.tsx
src/components/layout/StepRail.tsx
src/components/layout/PageTransition.tsx
src/components/layout/ProgressHairline.tsx
src/components/atoms/GradientRule.tsx
src/components/atoms/StepBadge.tsx
src/components/atoms/ConceptCard.tsx
src/components/home/JourneyOverview.tsx
src/components/step/StepLanding.tsx
src/components/scenes/PipelineOverview.tsx
src/components/scenes/SceneStage.tsx
src/lib/motion.ts
src/lib/steps.ts
src/app/steps/[step]/page.tsx
src/app/steps/[step]/[concept]/page.tsx
```

### Modified files
```
src/app/layout.tsx              — add Source Serif 4 font
src/app/globals.css             — replace token system
src/app/page.tsx                — use JourneyOverview
src/data/topics.ts              — rename to concepts.ts, new schema
src/lib/phaseColors.ts          — delete
src/components/layout/Sidebar.tsx — delete (replaced by StepRail)
src/components/topic/*.tsx      — refactor for new design
next.config.ts                  — add redirect map
```

### Deleted files
```
src/lib/phaseColors.ts
src/components/layout/Sidebar.tsx
```

---

## Phase A — Foundation

### Task A1: Add Source Serif 4 font

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css` (font variable)

- [ ] **Step 1: Add font import to layout.tsx**

Open `src/app/layout.tsx`. Find the existing `GeistSans` / `GeistMono` imports near the top. Add Source Serif 4 import below them:

```tsx
import { Source_Serif_4 } from "next/font/google";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-display",
});
```

In the `<html>` element, add `sourceSerif.variable` to the className list:

```tsx
<html
  lang="en"
  className={`${GeistSans.variable} ${GeistMono.variable} ${sourceSerif.variable}`}
>
```

- [ ] **Step 2: Verify font wiring**

Run: `npx tsc --noEmit`
Expected: no errors.

Run: `npm run dev` (note PID; stop after smoke test)
Open http://localhost:3000 in browser. View source → confirm a `<link>` to a `fonts.gstatic.com` URL for Source Serif. Inspect any element → confirm `--font-display` CSS variable is present on `<html>`.

- [ ] **Step 3: Commit**

```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals add src/app/layout.tsx
git -C /Users/pavankurmarao.k/Documents/personal/web-internals commit -m "feat: add Source Serif 4 display font"
```

---

### Task A2: Replace design token system

**Files:**
- Modify: `src/app/globals.css` (full theme block)

- [ ] **Step 1: Read current globals.css**

Read the existing `src/app/globals.css` to capture the current token structure before rewriting.

- [ ] **Step 2: Replace the `@theme` block**

Replace the entire `@theme` block in `src/app/globals.css` with this new system:

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

  /* Negative */
  --color-negative:       #FF6B6B;
  --color-negative-soft:  rgba(255, 107, 107, 0.06);

  /* Type */
  --font-display:  var(--font-display, 'Source Serif 4'), Georgia, serif;
  --font-sans:     var(--font-geist-sans);
  --font-mono:     var(--font-geist-mono);

  /* Type scale */
  --type-hero:      clamp(40px, 5vw, 64px);
  --type-title:     clamp(36px, 4vw, 52px);
  --type-section:   clamp(22px, 2vw, 28px);
  --type-lede:      18px;
  --type-body:      16px;
  --type-small:     14px;
  --type-caption:   12.5px;
  --type-eyebrow:   11px;
  --type-label:     10px;
  --type-tag:       9px;

  /* Spacing */
  --space-section:   48px;
  --space-block:     24px;
  --space-paragraph: 16px;
}
```

- [ ] **Step 3: Update body / selection / focus styles**

Below the `@theme` block, update or add:

```css
::selection {
  background: var(--color-accent-soft);
  color: var(--color-text-primary);
}

:focus-visible {
  outline: 1px solid var(--color-accent);
  outline-offset: 2px;
}

html {
  background: var(--color-bg);
  color: var(--color-text-primary);
  font-family: var(--font-sans);
  scroll-behavior: smooth;
}
```

Keep existing scrollbar styles. Drop any references to phase colors (e.g. `--color-phase-network`, `--color-phase-browser`, etc.) — these will surface as broken in Task A3, fixed by component refactor in Phase D.

- [ ] **Step 4: Verify compile (will have warnings)**

Run: `npx tsc --noEmit`
Expected: no errors (TS won't catch CSS issues).

Run: `npm run build`
Expected: build succeeds; may have CSS warnings about unused tokens. Components that reference `phaseColor()` still work because that helper still exists — they just won't render the right color yet. That's fine, fixed in Phase D.

- [ ] **Step 5: Commit**

```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals add src/app/globals.css
git -C /Users/pavankurmarao.k/Documents/personal/web-internals commit -m "feat: replace token system with Direction D — single ice cyan accent"
```

---

### Task A3: Build KOKA brand mark

**Files:**
- Create: `src/components/brand/KokaMark.tsx`

- [ ] **Step 1: Create directory and file**

```bash
mkdir -p /Users/pavankurmarao.k/Documents/personal/web-internals/src/components/brand
```

Create `src/components/brand/KokaMark.tsx`:

```tsx
"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export function KokaMark() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  // Hero (144x48) at top → Mini (72x24) once scrolled past 64px
  const width = useTransform(scrollY, [0, 64], [144, 72]);
  const height = useTransform(scrollY, [0, 64], [48, 24]);
  const opacity = useTransform(scrollY, [0, 64], [1, 0.85]);

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: prefersReducedMotion ? 1 : [0, 1, 1, 0],
      opacity: prefersReducedMotion ? 0.85 : [0, 1, 1, 0],
      transition: {
        duration: prefersReducedMotion ? 0 : 4,
        ease: [0.65, 0, 0.35, 1],
        delay: i * 0.1,
        times: [0, 0.375, 0.625, 1],
        repeat: prefersReducedMotion ? 0 : Infinity,
        repeatDelay: 0.5,
      },
    }),
  };

  return (
    <motion.div
      className="pointer-events-none fixed top-6 z-40"
      style={{
        left: "50%",
        x: "-50%",
        width,
        height,
        opacity,
      }}
      aria-hidden
    >
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 120 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial="hidden"
        animate="visible"
        style={{
          filter: "drop-shadow(0 0 12px var(--color-accent-glow))",
        }}
      >
        <defs>
          <linearGradient id="koka-mark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        {/* K (first letter) */}
        <motion.path d="M 18 5 L 18.001 35" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={0} variants={pathVariants} />
        <motion.path d="M18 20 L31 5" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={1} variants={pathVariants} />
        <motion.path d="M18 20 L31 35" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={2} variants={pathVariants} />
        {/* O */}
        <motion.path d="M37 20 C37 12.268 43.268 6 51 6 C58.732 6 65 12.268 65 20 C65 27.732 58.732 34 51 34 C43.268 34 37 27.732 37 20 Z" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={3} variants={pathVariants} />
        {/* K (second letter) */}
        <motion.path d="M 75 5 L 75.001 35" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={4} variants={pathVariants} />
        <motion.path d="M75 20 L88 5" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={5} variants={pathVariants} />
        <motion.path d="M75 20 L88 35" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={6} variants={pathVariants} />
        {/* A */}
        <motion.path d="M95 35 L105 5" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={7} variants={pathVariants} />
        <motion.path d="M105 5 L115 35" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={8} variants={pathVariants} />
        <motion.path d="M98 25 L112 25" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={9} variants={pathVariants} />
      </motion.svg>
    </motion.div>
  );
}
```

- [ ] **Step 2: Mount in root layout**

Edit `src/app/layout.tsx`. Import:

```tsx
import { KokaMark } from "@/components/brand/KokaMark";
```

In the `<body>` element, mount `<KokaMark />` as the first child (so it's globally fixed):

```tsx
<body>
  <KokaMark />
  {/* existing children */}
</body>
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: clean.

Run: `npm run dev`
Open http://localhost:3000. Confirm: KOKA mark is centered at top, draws-in K-O-K-A strokes, loops every ~4.5s. Scroll down → mark shrinks to half-size, slightly faded. Test on a concept page too.

- [ ] **Step 4: Commit**

```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals add src/app/layout.tsx src/components/brand/
git -C /Users/pavankurmarao.k/Documents/personal/web-internals commit -m "feat: add KOKA brand mark with scroll-driven shrink"
```

---

### Task A4: Build shared motion primitives

**Files:**
- Create: `src/lib/motion.ts`

- [ ] **Step 1: Create file**

```ts
import type { Variants } from "framer-motion";

export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  inBack: [0.5, -0.5, 0.5, 1.5] as const,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: ease.out },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: ease.out } },
};

export const stagger = (gap = 0.08): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: gap } },
});

export const drawRule: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.8, ease: ease.out },
  },
};

export const heroEntrance: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: ease.out, delay: 0.08 },
  },
};

export const demoReveal: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: ease.out, delay: 0.32 },
  },
};

export const railDotActive: Variants = {
  rest: { scale: 1, opacity: 0.85 },
  pulse: {
    opacity: [0.85, 1, 0.85],
    transition: { duration: 2, repeat: Infinity, ease: "linear" },
  },
};

export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.24, ease: ease.out },
};
```

- [ ] **Step 2: Verify TypeScript types**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals add src/lib/motion.ts
git -C /Users/pavankurmarao.k/Documents/personal/web-internals commit -m "feat: add shared motion primitives in src/lib/motion.ts"
```

---

### Task A5: Build small atomic components

**Files:**
- Create: `src/components/atoms/GradientRule.tsx`
- Create: `src/components/atoms/StepBadge.tsx`
- Create: `src/components/atoms/ConceptCard.tsx`
- Create: `src/components/layout/ProgressHairline.tsx`

- [ ] **Step 1: GradientRule**

Create `src/components/atoms/GradientRule.tsx`:

```tsx
"use client";
import { motion } from "framer-motion";
import { drawRule } from "@/lib/motion";

export function GradientRule({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`relative h-px w-full ${className}`}
      style={{ transformOrigin: "left" }}
      variants={drawRule}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, var(--color-accent-line) 0%, rgba(125,211,252,0.05) 32%, transparent 65%)",
        }}
      />
    </motion.div>
  );
}
```

- [ ] **Step 2: StepBadge**

Create `src/components/atoms/StepBadge.tsx`:

```tsx
export interface StepBadgeProps {
  step: number;
  total?: number;
  label?: string;
  className?: string;
}

export function StepBadge({ step, total = 7, label, className = "" }: StepBadgeProps) {
  return (
    <div
      className={`inline-flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-text-muted)] ${className}`}
    >
      <span className="text-[color:var(--color-accent)]">
        {String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
      {label && (
        <>
          <span className="h-px w-6 bg-[color:var(--color-border)]" aria-hidden />
          <span>{label}</span>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: ConceptCard**

Create `src/components/atoms/ConceptCard.tsx`:

```tsx
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export interface ConceptCardProps {
  href: string;
  step: number;
  index: number; // position within step
  globalOrder: number;
  title: string;
  hook: string;
  isNew?: boolean;
}

export function ConceptCard({ href, step, index, globalOrder, title, hook, isNew }: ConceptCardProps) {
  return (
    <motion.div variants={fadeUp}>
      <Link
        href={href}
        className="group block border-b border-[color:var(--color-border)] py-5 transition-colors hover:bg-[color:var(--color-accent-soft)]"
      >
        <div className="flex items-baseline gap-6">
          <span className="min-w-[3.5rem] font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-text-dim)]">
            {String(step).padStart(2, "0")}.{index}
          </span>
          <div className="flex-1">
            <h3 className="font-[family-name:var(--font-display)] text-[18px] leading-tight text-[color:var(--color-text-primary)]">
              {title}
              {isNew && (
                <span className="ml-3 font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                  new
                </span>
              )}
            </h3>
            <p className="mt-1.5 max-w-[58ch] text-[13.5px] leading-relaxed text-[color:var(--color-text-secondary)]">
              {hook}
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] transition-colors group-hover:text-[color:var(--color-accent)]">
            #{String(globalOrder).padStart(2, "0")}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
```

- [ ] **Step 4: ProgressHairline**

Create `src/components/layout/ProgressHairline.tsx`:

```tsx
"use client";
import { motion, useScroll } from "framer-motion";

export function ProgressHairline() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 z-30 h-px origin-left"
      style={{
        scaleX: scrollYProgress,
        background: "var(--color-accent-line)",
      }}
      aria-hidden
    />
  );
}
```

- [ ] **Step 5: Mount ProgressHairline in layout**

Edit `src/app/layout.tsx`. Add import:

```tsx
import { ProgressHairline } from "@/components/layout/ProgressHairline";
```

Add `<ProgressHairline />` in `<body>`, right after `<KokaMark />`:

```tsx
<body>
  <KokaMark />
  <ProgressHairline />
  {/* existing children */}
</body>
```

- [ ] **Step 6: Verify**

Run: `npx tsc --noEmit`
Expected: clean.

Run: `npm run dev`. Confirm:
- Bottom-of-page hairline appears as you scroll, advancing left→right.
- No console errors.

- [ ] **Step 7: Commit**

```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals add src/components/atoms/ src/components/layout/ProgressHairline.tsx src/app/layout.tsx
git -C /Users/pavankurmarao.k/Documents/personal/web-internals commit -m "feat: add atomic components — GradientRule, StepBadge, ConceptCard, ProgressHairline"
```

---

## Phase B — Layout shells & data restructure

### Task B1: Define step data model

**Files:**
- Create: `src/lib/steps.ts`

- [ ] **Step 1: Create step metadata**

Create `src/lib/steps.ts`:

```ts
export interface StepMeta {
  step: number;          // 1..7
  slug: string;          // "01-network"
  title: string;
  arrow: string;         // "address → server"
  lede: string;
  conceptCount: number;  // including overview if step 0
}

export const STEPS: StepMeta[] = [
  {
    step: 1,
    slug: "01-network",
    title: "Network & transport",
    arrow: "address → server",
    lede: "You press Enter. The browser turns a string into bytes traveling over the wire — resolution, handshakes, fetch, and the hints you give to do it smarter.",
    conceptCount: 10,
  },
  {
    step: 2,
    slug: "02-parsing",
    title: "Parsing",
    arrow: "bytes → document",
    lede: "Bytes become a DOM, CSS becomes a CSSOM, and any script the parser hits runs immediately — that's where V8 first enters the journey.",
    conceptCount: 3,
  },
  {
    step: 3,
    slug: "03-style",
    title: "Style & tree construction",
    arrow: "document → render tree",
    lede: "DOM and CSSOM walk together. The browser computes which rules apply, builds the render tree of visible nodes, then the layout tree of geometry candidates.",
    conceptCount: 3,
  },
  {
    step: 4,
    slug: "04-layout",
    title: "Layout",
    arrow: "render tree → geometry",
    lede: "The browser assigns position and size to every box. Reflow walks the tree; containment tells the engine where it can stop.",
    conceptCount: 2,
  },
  {
    step: 5,
    slug: "05-paint",
    title: "Paint",
    arrow: "geometry → draw commands",
    lede: "Geometry doesn't make pixels — draw commands do. The browser records a display list per layer and resolves stacking, transforms, and effects.",
    conceptCount: 4,
  },
  {
    step: 6,
    slug: "06-compositing",
    title: "Compositing",
    arrow: "draw commands → layers",
    lede: "The main thread hands off to the compositor. Layers promote, commit happens, tiles rasterize on the GPU, the final frame assembles.",
    conceptCount: 4,
  },
  {
    step: 7,
    slug: "07-display",
    title: "Display",
    arrow: "layers → pixels",
    lede: "VSync ticks. The OS asks for a frame. The compositor presents the assembled image to the screen. Frame budget — what you spent vs. what you had — is the punctuation.",
    conceptCount: 2,
  },
];

export function stepBySlug(slug: string): StepMeta | undefined {
  return STEPS.find((s) => s.slug === slug);
}

export function stepByNumber(n: number): StepMeta | undefined {
  return STEPS.find((s) => s.step === n);
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 3: Commit**

```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals add src/lib/steps.ts
git -C /Users/pavankurmarao.k/Documents/personal/web-internals commit -m "feat: add 7-step metadata in src/lib/steps.ts"
```

---

### Task B2: Migrate concepts data schema

**Files:**
- Modify: `src/data/topics.ts` (in-place schema migration)
- Modify: any consumers (catch-up after schema change)

- [ ] **Step 1: Inspect current topics.ts**

Read `src/data/topics.ts`. Note current `Topic` interface and the 17 entries.

- [ ] **Step 2: Extend Topic with step + globalOrder**

Add to the `Topic` interface (keep all existing fields, add these):

```ts
export interface Topic {
  // ... existing fields kept ...
  step?: number;            // 1..7, derived from phase initially
  globalOrder?: number;     // 1..28, derived from journey order
  arrow?: string;           // optional; derived from step
  hook?: string;            // 2-3 sentence hook for cards
  newConcept?: boolean;
  source?: "original" | "hbr" | "wf";
}
```

- [ ] **Step 3: Add per-topic step/order mapping**

Append at the bottom of `src/data/topics.ts`:

```ts
// Step assignment — maps each topic.id to its new step + position
// (matches spec §3.2 / §3.3)
export const TOPIC_STEP_MAP: Record<string, { step: number; order: number; globalOrder: number }> = {
  // Step 1 — Network & transport
  "url-parsing":        { step: 1, order: 1, globalOrder: 1 },
  "service-workers":    { step: 1, order: 2, globalOrder: 2 },
  "dns-resolution":     { step: 1, order: 3, globalOrder: 3 },
  "tcp-connection":     { step: 1, order: 4, globalOrder: 4 },
  "tls-handshake":      { step: 1, order: 5, globalOrder: 5 },
  "http-request":       { step: 1, order: 6, globalOrder: 6 },
  "http-caching":       { step: 1, order: 7, globalOrder: 7 },
  "cdn-edge":           { step: 1, order: 8, globalOrder: 8 },
  // Step 2 — Parsing
  "html-parsing":       { step: 2, order: 1, globalOrder: 11 },
  "css-parsing":        { step: 2, order: 2, globalOrder: 12 },
  // Step 3
  "render-tree":        { step: 3, order: 2, globalOrder: 15 },
  // Step 4
  "layout":             { step: 4, order: 1, globalOrder: 17 },
  // Step 5
  "paint":              { step: 5, order: 4, globalOrder: 22 },
  // Step 6
  "compositing":        { step: 6, order: 4, globalOrder: 26 },
  // Step 7
  "frame-budget":       { step: 7, order: 2, globalOrder: 28 },
};

// Source attribution for kept topics
export const TOPIC_SOURCES: Record<string, "original" | "hbr" | "wf"> = {
  "url-parsing": "original",
  "service-workers": "original",
  "dns-resolution": "original",
  "tcp-connection": "original",
  "tls-handshake": "original",
  "http-request": "original",
  "http-caching": "original",
  "cdn-edge": "original",
  "html-parsing": "original",
  "css-parsing": "original",
  "render-tree": "original",
  "layout": "original",
  "paint": "original",
  "compositing": "original",
  "frame-budget": "original",
};
```

Also adjust `v8-engine` and `event-loop` — these are slated to be folded into `02.3 scripts-during-parsing`. For now, leave them in the topics array but mark them as deprecated:

```ts
// Add to TOPIC_STEP_MAP (these will be merged into a new entry in Phase E)
"v8-engine":          { step: 2, order: 3, globalOrder: 13 },  // → will merge into scripts-during-parsing
"event-loop":         { step: 2, order: 3, globalOrder: 13 },  // → same
```

- [ ] **Step 4: Add helpers**

At the bottom of `src/data/topics.ts`, append:

```ts
export function getTopicStep(id: string) {
  return TOPIC_STEP_MAP[id];
}

export function getTopicsByStep(step: number): Topic[] {
  return topics
    .filter((t) => TOPIC_STEP_MAP[t.id]?.step === step)
    .sort((a, b) => (TOPIC_STEP_MAP[a.id]?.order ?? 0) - (TOPIC_STEP_MAP[b.id]?.order ?? 0));
}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 6: Commit**

```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals add src/data/topics.ts
git -C /Users/pavankurmarao.k/Documents/personal/web-internals commit -m "feat: extend Topic schema with step/globalOrder mapping"
```

---

### Task B3: Build StepRail

**Files:**
- Create: `src/components/layout/StepRail.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create StepRail**

Create `src/components/layout/StepRail.tsx`:

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { STEPS } from "@/lib/steps";
import { railDotActive } from "@/lib/motion";

export function StepRail() {
  const pathname = usePathname();
  const activeStep = parseActiveStep(pathname);

  return (
    <nav
      aria-label="Tutorial steps"
      className="fixed left-8 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
    >
      <ol className="flex flex-col gap-4">
        {STEPS.map((s) => {
          const isActive = activeStep === s.step;
          const isVisited = activeStep !== null && activeStep > s.step;
          return (
            <li key={s.step} className="group relative">
              <Link
                href={`/steps/${s.slug}`}
                className="block"
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${s.step}: ${s.title}`}
              >
                <motion.span
                  className="block h-2 w-2 rounded-full border transition-all duration-200"
                  variants={railDotActive}
                  animate={isActive ? "pulse" : "rest"}
                  style={{
                    borderColor: isActive
                      ? "var(--color-accent)"
                      : isVisited
                      ? "var(--color-text-muted)"
                      : "var(--color-text-dim)",
                    background: isActive
                      ? "var(--color-accent)"
                      : isVisited
                      ? "var(--color-text-muted)"
                      : "transparent",
                  }}
                />
              </Link>
              {/* hover label */}
              <span
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-text-secondary)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                Step {String(s.step).padStart(2, "0")} — {s.title}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function parseActiveStep(pathname: string): number | null {
  // Matches /steps/01-network or /steps/01-network/url-parsing
  const m = pathname.match(/\/steps\/(\d{2})-/);
  return m ? parseInt(m[1], 10) : null;
}
```

- [ ] **Step 2: Mount in root layout**

Edit `src/app/layout.tsx`. Import:

```tsx
import { StepRail } from "@/components/layout/StepRail";
```

Add `<StepRail />` in `<body>` after `<ProgressHairline />`:

```tsx
<body>
  <KokaMark />
  <ProgressHairline />
  <StepRail />
  {/* existing children */}
</body>
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: clean.

Run: `npm run dev`. Open http://localhost:3000. On screens ≥1024px wide, confirm:
- 7 dots stacked vertically on left side
- No active dot (we're on home, not in `/steps/`)
- Hover over a dot → label slides in to the right
- Click a dot → navigates to `/steps/01-network` (will 404 until Task C1)

- [ ] **Step 4: Commit**

```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals add src/components/layout/StepRail.tsx src/app/layout.tsx
git -C /Users/pavankurmarao.k/Documents/personal/web-internals commit -m "feat: add StepRail — persistent 7-dot left rail"
```

---

### Task B4: Page transition wrapper

**Files:**
- Create: `src/components/layout/PageTransition.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create PageTransition**

```tsx
"use client";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { pageTransition } from "@/lib/motion";
import type { ReactNode } from "react";

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={pageTransition.initial}
        animate={pageTransition.animate}
        exit={pageTransition.exit}
        transition={pageTransition.transition}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

- [ ] **Step 2: Mount in root layout**

Edit `src/app/layout.tsx`. Wrap `{children}` with `<PageTransition>`:

```tsx
import { PageTransition } from "@/components/layout/PageTransition";

// ...

<body>
  <KokaMark />
  <ProgressHairline />
  <StepRail />
  <PageTransition>{children}</PageTransition>
</body>
```

- [ ] **Step 3: Verify**

Run: `npm run dev`. Click between pages (home → any topic). Confirm:
- Smooth fade + slide between pages (no flash)
- No layout jank from KOKA mark, rail, or progress (these are fixed)

- [ ] **Step 4: Commit**

```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals add src/components/layout/PageTransition.tsx src/app/layout.tsx
git -C /Users/pavankurmarao.k/Documents/personal/web-internals commit -m "feat: add page transition wrapper with AnimatePresence"
```

---

## Phase C — Routing restructure

### Task C1: Step landing pages

**Files:**
- Create: `src/app/steps/[step]/page.tsx`
- Create: `src/components/step/StepLanding.tsx`

- [ ] **Step 1: Build StepLanding component**

Create `src/components/step/StepLanding.tsx`:

```tsx
"use client";
import { motion } from "framer-motion";
import { StepMeta } from "@/lib/steps";
import { StepBadge } from "@/components/atoms/StepBadge";
import { GradientRule } from "@/components/atoms/GradientRule";
import { ConceptCard } from "@/components/atoms/ConceptCard";
import { stagger, fadeUp, heroEntrance } from "@/lib/motion";
import { Topic } from "@/data/topics";
import { TOPIC_STEP_MAP } from "@/data/topics";

interface Props {
  step: StepMeta;
  concepts: Topic[];
}

export function StepLanding({ step, concepts }: Props) {
  return (
    <main className="mx-auto max-w-[840px] px-8 pt-32 pb-24 lg:pl-24">
      <motion.div initial="hidden" animate="visible" variants={stagger(0.08)}>
        <motion.div variants={fadeUp}>
          <StepBadge step={step.step} label={step.arrow} />
        </motion.div>
        <motion.h1
          variants={heroEntrance}
          className="mt-4 font-[family-name:var(--font-display)] text-[var(--type-title)] leading-[1.05] tracking-[-0.018em] text-[color:var(--color-text-primary)]"
        >
          {step.title}
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-[58ch] text-[var(--type-lede)] leading-[1.55] text-[color:var(--color-text-secondary)]"
        >
          {step.lede}
        </motion.p>

        <div className="mt-12">
          <GradientRule />
        </div>

        <motion.div
          className="mt-8 font-mono text-[var(--type-label)] uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]"
          variants={fadeUp}
        >
          Concepts in this step
        </motion.div>

        <motion.div className="mt-4" variants={stagger(0.06)}>
          {concepts.map((c) => {
            const m = TOPIC_STEP_MAP[c.id];
            return (
              <ConceptCard
                key={c.id}
                href={`/steps/${step.slug}/${c.id}`}
                step={step.step}
                index={m?.order ?? 0}
                globalOrder={m?.globalOrder ?? 0}
                title={c.title}
                hook={c.subtitle || ""}
              />
            );
          })}
        </motion.div>
      </motion.div>
    </main>
  );
}
```

- [ ] **Step 2: Build step landing route**

Create `src/app/steps/[step]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { STEPS, stepBySlug } from "@/lib/steps";
import { getTopicsByStep } from "@/data/topics";
import { StepLanding } from "@/components/step/StepLanding";

export function generateStaticParams() {
  return STEPS.map((s) => ({ step: s.slug }));
}

interface Props {
  params: Promise<{ step: string }>;
}

export default async function Page({ params }: Props) {
  const { step: stepSlug } = await params;
  const stepMeta = stepBySlug(stepSlug);
  if (!stepMeta) notFound();

  const concepts = getTopicsByStep(stepMeta.step);

  return <StepLanding step={stepMeta} concepts={concepts} />;
}
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: clean.

Run: `npm run dev`. Visit http://localhost:3000/steps/01-network — confirm landing page with title "Network & transport", arrow eyebrow, lede, and concept list (only existing concepts in step 1; new ones come in Phase E).

- [ ] **Step 4: Commit**

```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals add src/app/steps/ src/components/step/
git -C /Users/pavankurmarao.k/Documents/personal/web-internals commit -m "feat: add step landing pages at /steps/[step]"
```

---

### Task C2: Concept route under step

**Files:**
- Create: `src/app/steps/[step]/[concept]/page.tsx`

- [ ] **Step 1: Build the concept route**

Create `src/app/steps/[step]/[concept]/page.tsx`. This wraps the existing concept page logic but reads from the new URL shape.

```tsx
import { notFound } from "next/navigation";
import { getTopicBySlug, getAdjacentTopics, TOPIC_STEP_MAP } from "@/data/topics";
import { stepBySlug, stepByNumber } from "@/lib/steps";
import { TopicHero } from "@/components/topic/TopicHero";
import { ConceptSection } from "@/components/topic/ConceptSection";
import { FactsGrid } from "@/components/topic/FactsGrid";
import { InsightCallout } from "@/components/topic/InsightCallout";
import { CodeDemo } from "@/components/topic/CodeDemo";
import { TopicNav } from "@/components/topic/TopicNav";
import { ProgressTracker } from "@/components/topic/ProgressTracker";
import { SceneLoader } from "@/components/scenes/SceneLoader";
import { STEPS } from "@/lib/steps";
import { topics } from "@/data/topics";

export function generateStaticParams() {
  return topics
    .filter((t) => TOPIC_STEP_MAP[t.id])
    .map((t) => {
      const stepMeta = stepByNumber(TOPIC_STEP_MAP[t.id].step);
      return { step: stepMeta!.slug, concept: t.id };
    });
}

interface Props {
  params: Promise<{ step: string; concept: string }>;
}

export default async function Page({ params }: Props) {
  const { step: stepSlug, concept: conceptId } = await params;
  const stepMeta = stepBySlug(stepSlug);
  const topic = getTopicBySlug(conceptId);

  if (!stepMeta || !topic) notFound();
  if (TOPIC_STEP_MAP[topic.id]?.step !== stepMeta.step) notFound();

  const { prev, next } = getAdjacentTopics(topic.id);

  return (
    <main className="mx-auto max-w-[840px] px-8 pt-32 pb-24 lg:pl-24">
      <ProgressTracker topicId={topic.id} />
      <TopicHero topic={topic} />
      <SceneLoader sceneKey={topic.sceneKey} />
      <ConceptSection example={topic.example} />
      {topic.codeDemo && <CodeDemo {...topic.codeDemo} phase={topic.phase} />}
      <FactsGrid topic={topic} />
      {topic.insight && <InsightCallout insight={topic.insight} phase={topic.phase} />}
      <TopicNav prev={prev} next={next} />
    </main>
  );
}
```

Note: This reuses existing components (TopicHero, etc.) — they still pull phase color from `phaseColor()`. That's fine; visual refactor happens in Phase D.

- [ ] **Step 2: Verify**

Run: `npm run dev`. Visit http://localhost:3000/steps/01-network/url-parsing — confirm the topic page renders. Old style is fine for now.

- [ ] **Step 3: Commit**

```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals add src/app/steps/
git -C /Users/pavankurmarao.k/Documents/personal/web-internals commit -m "feat: add concept route at /steps/[step]/[concept]"
```

---

### Task C3: Redirects from old URLs

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: Add redirects**

Open `next.config.ts`. Add a `redirects()` async function that maps every old concept slug to its new path:

```ts
import type { NextConfig } from "next";

const REDIRECT_MAP: Record<string, string> = {
  "/url-parsing": "/steps/01-network/url-parsing",
  "/service-workers": "/steps/01-network/service-workers",
  "/dns-resolution": "/steps/01-network/dns-resolution",
  "/tcp-connection": "/steps/01-network/tcp-connection",
  "/tls-handshake": "/steps/01-network/tls-handshake",
  "/http-request": "/steps/01-network/http-request",
  "/http-caching": "/steps/01-network/http-caching",
  "/cdn-edge": "/steps/01-network/cdn-edge",
  "/html-parsing": "/steps/02-parsing/html-parsing",
  "/css-parsing": "/steps/02-parsing/css-parsing",
  "/v8-engine": "/steps/02-parsing/scripts-during-parsing",
  "/event-loop": "/steps/02-parsing/scripts-during-parsing",
  "/render-tree": "/steps/03-style/render-tree",
  "/layout": "/steps/04-layout/layout",
  "/paint": "/steps/05-paint/paint",
  "/compositing": "/steps/06-compositing/compositing",
  "/frame-budget": "/steps/07-display/frame-budget",
};

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(REDIRECT_MAP).map(([source, destination]) => ({
      source,
      destination,
      permanent: true,
    }));
  },
};

export default nextConfig;
```

- [ ] **Step 2: Verify**

Run: `npm run dev`. Visit http://localhost:3000/url-parsing — should 301-redirect to http://localhost:3000/steps/01-network/url-parsing.

- [ ] **Step 3: Commit**

```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals add next.config.ts
git -C /Users/pavankurmarao.k/Documents/personal/web-internals commit -m "feat: 301-redirect old URLs to new /steps/* paths"
```

---

### Task C4: Update home page to JourneyOverview

**Files:**
- Create: `src/components/home/JourneyOverview.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build JourneyOverview**

```tsx
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { STEPS } from "@/lib/steps";
import { StepBadge } from "@/components/atoms/StepBadge";
import { GradientRule } from "@/components/atoms/GradientRule";
import { stagger, fadeUp, heroEntrance } from "@/lib/motion";

export function JourneyOverview() {
  return (
    <main className="mx-auto max-w-[840px] px-8 pt-32 pb-24 lg:pl-24">
      <motion.div initial="hidden" animate="visible" variants={stagger(0.08)}>
        <motion.div variants={fadeUp} className="font-mono text-[var(--type-eyebrow)] uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
          web-internals · tutorial
        </motion.div>
        <motion.h1
          variants={heroEntrance}
          className="mt-3 font-[family-name:var(--font-display)] text-[var(--type-hero)] leading-[1.05] tracking-[-0.018em] text-[color:var(--color-text-primary)]"
        >
          From URL to pixels.<br/>In seven steps.
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-[58ch] text-[var(--type-lede)] leading-[1.55] text-[color:var(--color-text-secondary)]"
        >
          The browser's journey, beginning when you press Enter and ending when pixels appear on the screen. Each step builds on the last — start anywhere, but the story works best in order.
        </motion.p>

        <div className="mt-12"><GradientRule /></div>

        <motion.div className="mt-8" variants={stagger(0.06)}>
          {STEPS.map((s) => (
            <motion.div key={s.step} variants={fadeUp}>
              <Link
                href={`/steps/${s.slug}`}
                className="group block border-b border-[color:var(--color-border)] py-6 transition-colors hover:bg-[color:var(--color-accent-soft)]"
              >
                <div className="flex items-baseline gap-6">
                  <span className="min-w-[2.5rem] font-mono text-[var(--type-eyebrow)] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
                    {String(s.step).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
                      {s.arrow}
                    </div>
                    <h2 className="mt-1 font-[family-name:var(--font-display)] text-[22px] leading-tight text-[color:var(--color-text-primary)]">
                      {s.title}
                    </h2>
                    <p className="mt-2 max-w-[58ch] text-[14px] leading-relaxed text-[color:var(--color-text-secondary)]">
                      {s.lede}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] transition-colors group-hover:text-[color:var(--color-accent)]">
                    begin →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
}
```

- [ ] **Step 2: Replace home page**

Edit `src/app/page.tsx`. Replace entire file contents:

```tsx
import { JourneyOverview } from "@/components/home/JourneyOverview";

export default function Page() {
  return <JourneyOverview />;
}
```

(Keeps the old HeroScene file in place — it'll be refactored to PipelineOverview later in Phase E.)

- [ ] **Step 3: Verify**

Run: `npm run dev`. Open http://localhost:3000. Confirm new editorial home with 7 step cards. Click into any step → loads step landing.

- [ ] **Step 4: Commit**

```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals add src/components/home/ src/app/page.tsx
git -C /Users/pavankurmarao.k/Documents/personal/web-internals commit -m "feat: replace home with JourneyOverview — 7-step editorial entry"
```

---

### Task C5: Retire Sidebar

**Files:**
- Modify: `src/app/layout.tsx` (remove Sidebar mount)
- Delete: `src/components/layout/Sidebar.tsx` (deferred to after Phase D verifies StepRail is sufficient)

- [ ] **Step 1: Remove Sidebar from layout**

Open `src/app/layout.tsx`. Remove the `import` for `Sidebar` and its `<Sidebar />` mount. The StepRail replaces it.

- [ ] **Step 2: Verify**

Run: `npm run dev`. Confirm:
- Home renders without left sidebar (only the rail)
- Topic pages render without left sidebar
- StepRail dots are present + functional

- [ ] **Step 3: Commit**

```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals add src/app/layout.tsx
git -C /Users/pavankurmarao.k/Documents/personal/web-internals commit -m "refactor: retire Sidebar component; StepRail is the nav now"
```

---

## Phase D — Existing concept refactor

Apply Direction D to the 6 topic components. Each gets the same treatment: drop phase color, switch to ice-cyan accent + numbered eyebrow, refine type with Source Serif 4 for titles/section heads.

### Task D1: Refactor TopicHero → ConceptHero

**Files:**
- Modify: `src/components/topic/TopicHero.tsx`

- [ ] **Step 1: Rewrite TopicHero**

Replace the body of `src/components/topic/TopicHero.tsx`:

```tsx
"use client";
import { motion } from "framer-motion";
import { Topic, TOPIC_STEP_MAP } from "@/data/topics";
import { stepByNumber } from "@/lib/steps";
import { StepBadge } from "@/components/atoms/StepBadge";
import { stagger, fadeUp, heroEntrance } from "@/lib/motion";

export function TopicHero({ topic }: { topic: Topic }) {
  const stepInfo = TOPIC_STEP_MAP[topic.id];
  const step = stepInfo ? stepByNumber(stepInfo.step) : undefined;

  return (
    <motion.header initial="hidden" animate="visible" variants={stagger(0.08)}>
      <motion.div variants={fadeUp}>
        {step && (
          <StepBadge
            step={step.step}
            label={`${step.title} · ${step.arrow}`}
          />
        )}
      </motion.div>
      <motion.h1
        variants={heroEntrance}
        className="mt-4 font-[family-name:var(--font-display)] text-[var(--type-title)] leading-[1.05] tracking-[-0.018em] text-[color:var(--color-text-primary)]"
      >
        {topic.title}
      </motion.h1>
      {topic.subtitle && (
        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-[58ch] text-[var(--type-lede)] leading-[1.55] text-[color:var(--color-text-secondary)]"
        >
          {topic.subtitle}
        </motion.p>
      )}
      <motion.div variants={fadeUp} className="mt-10 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-text-dim)]">
        {stepInfo && (
          <>
            concept {String(stepInfo.globalOrder).padStart(2, "0")} of 28 · step {String(step?.step ?? 0).padStart(2, "0")}.{stepInfo.order}
          </>
        )}
      </motion.div>
    </motion.header>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run dev`. Visit a concept page. Confirm: new editorial hero, no phase color badge, numbered step counter.

- [ ] **Step 3: Commit**

```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals add src/components/topic/TopicHero.tsx
git -C /Users/pavankurmarao.k/Documents/personal/web-internals commit -m "refactor: TopicHero adopts Direction D (no phase color, numbered eyebrow)"
```

---

### Task D2-D6: Refactor remaining topic components

Apply the same Direction D treatment to:

- **D2** `ConceptSection.tsx` — switch section heads to Source Serif 4, code blocks to single ice cyan accent, step numbers in mono
- **D3** `FactsGrid.tsx` — drop phase color; cards get hairline border + ice cyan dot
- **D4** `InsightCallout.tsx` — border-left becomes `var(--color-accent-line)`; radial glow uses `--color-accent-glow`
- **D5** `CodeDemo.tsx` — bad button uses `--color-negative`, good uses `--color-accent`; refined mono treatment
- **D6** `TopicNav.tsx` — prev/next cards drop phase color, use step+arrow context

Each task follows the same TDD-less pattern: replace contents, drop all `phaseColor()` and `topic.phase` references, switch to `var(--color-accent)` / `var(--color-text-*)`. Use Source Serif 4 for any titles/section heads. Use `var(--font-mono)` for eyebrows/labels with `0.22em` letter-spacing.

For each task: verify visually via `npm run dev`, then commit individually.

**After D2-D6 complete: delete phaseColors helper.**

```bash
rm /Users/pavankurmarao.k/Documents/personal/web-internals/src/lib/phaseColors.ts
```

Run: `npx tsc --noEmit` to find any remaining references and fix them.

Commit:
```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals add -A
git -C /Users/pavankurmarao.k/Documents/personal/web-internals commit -m "refactor: complete Direction D — delete phaseColors.ts, all components on single accent"
```

---

## Phase E — Content port (new concepts)

For each of the 11 new concepts, perform these steps:

1. **Add concept to `src/data/topics.ts`** with full body, facts, insight, codeDemo
2. **Update `TOPIC_STEP_MAP`** with step/order/globalOrder
3. **Add to `TOPIC_SOURCES`** with `"hbr"` or `"wf"`
4. **Build scene** in `src/components/scenes/` (matching `sceneKey`)
5. **Register scene** in `src/components/scenes/SceneLoader.tsx`
6. **Verify dev render**
7. **Commit**

Use the deep-read transcripts (in conversation context) as source for theory. Reframe in `web-internals` voice. Author 4-6 facts per concept, 1-2 sentence Engineer's Insight, optional CodeDemo for patterns.

### Task E1: 02.3 Scripts during parsing (folds V8 + Event Loop)

**Source:** Authored from web-fundamentals CRP content + standard refs. Folds the current `v8-engine` and `event-loop` topics — these get marked deprecated in the topics array and their slugs redirect via Task C3 already.

**Scene direction:** Canvas 2D, animated HTML parser advancing through a document, pausing at `<script>` tags. Sync scripts halt parse for fake `engine.execute()` time; async/defer keep parsing.

**Concept content:**
- Title: "Scripts during parsing"
- Subtitle: "Where V8 first enters the journey — and what it costs to halt the parser."
- Body: 3-4 paragraphs on parser-blocking vs `async` vs `defer` vs `type=module`. The microtask queue's role. Where the document is "interactive enough" to keep going.

(Detailed body content drafted at execution time using deep-read material.)

### Task E2-E11: Remaining 10 new concepts

Follow same template per concept. The 10 are:

| Task | ID | Step | Source | Scene type |
|------|-----|------|--------|------------|
| E2 | `resource-hints` | 01.9 | wf | Canvas 2D — animated waterfall showing preload vs unhinted |
| E3 | `resource-loading-priorities` | 01.10 | wf | Canvas 2D — fetch priority sort visualizer |
| E4 | `style-recalculation` | 03.1 | hbr | R3F — DOM tree with style-dirty propagation |
| E5 | `layout-tree-construction` | 03.3 | hbr | R3F — DOM vs LayoutObject filter (display:none drops) |
| E6 | `containment` | 04.2 | hbr | Canvas 2D — three columns; toggle `contain` on middle; child width slider |
| E7 | `display-lists` | 05.1 | hbr | Canvas 2D — paint command list rolling out |
| E8 | `stacking-contexts` | 05.2 | hbr | R3F — z-order box with opacity / z-index sliders, child can't escape |
| E9 | `property-trees` | 05.3 | hbr | R3F — abstract property tree (transform/clip/effect nodes) |
| E10 | `layer-promotion` | 06.1 | hbr | Canvas 2D — `will-change` toggle adds a promoted layer |
| E11 | `commit-and-compositor-thread` | 06.2 | hbr | Canvas 2D — main thread → compositor handoff cycle |
| E12 | `tiling-rasterization` | 06.3 | hbr | Canvas 2D — tile grid filling green ("rasterized") |
| E13 | `vsync-display` | 07.1 | hbr | Canvas 2D — heartbeat bars at 60Hz vs 120Hz |

Each task = scene + concept data + commit.

After all 12 added, also:

### Task E14: Pipeline overview (Step 0)

Refactor `src/components/home/HeroScene.tsx` into `src/components/scenes/PipelineOverview.tsx`. Same particle pipeline but mapped to the new 7-step structure. Add to home below the JourneyOverview cards.

---

## Phase F — Animation polish

### Task F1: Wire scene entrance from blur

**Files:**
- Modify: `src/components/scenes/SceneLoader.tsx`

- [ ] **Step 1: Wrap with entrance blur**

After SceneLoader resolves the dynamic import, wrap the rendered scene in a Framer Motion div that animates `filter` from `blur(8px)` to `blur(0)` and opacity 0→1 over 400ms ease.out. Triggered on mount (post-suspense).

```tsx
<motion.div
  initial={{ opacity: 0, filter: "blur(8px)" }}
  animate={{ opacity: 1, filter: "blur(0px)" }}
  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
>
  <Scene />
</motion.div>
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals add src/components/scenes/SceneLoader.tsx
git -C /Users/pavankurmarao.k/Documents/personal/web-internals commit -m "feat: scene entrance from blur (400ms ease.out)"
```

### Task F2: Offscreen scene pause

**Files:**
- Create: `src/components/scenes/SceneStage.tsx`
- Refactor: each scene to wrap content in SceneStage

- [ ] **Step 1: Build SceneStage**

```tsx
"use client";
import { useEffect, useRef, useState, ReactNode } from "react";

export function SceneStage({
  children,
  onVisibility,
}: { children: ReactNode; onVisibility?: (visible: boolean) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        setVisible(e.isIntersecting);
        onVisibility?.(e.isIntersecting);
      },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [onVisibility]);

  return (
    <div ref={ref} className="relative w-full">
      {visible && children}
    </div>
  );
}
```

- [ ] **Step 2: Each scene opts into pause**

Within each scene's animation loop, check a `visibleRef` updated by `onVisibility`. Skip `requestAnimationFrame` work when offscreen. (Apply progressively to existing scenes; new scenes built in Phase E already use this pattern.)

- [ ] **Step 3: Commit**

```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals add src/components/scenes/
git -C /Users/pavankurmarao.k/Documents/personal/web-internals commit -m "feat: SceneStage with offscreen rAF pause"
```

### Tasks F3-F6: Remaining polish

- **F3** Demo card hover/click interactions — refine CodeDemo button states + 200ms transitions
- **F4** Numbered eyebrow scrub on route change — `AnimatePresence` key on the StepBadge component
- **F5** Reduced motion audit — find every motion component, ensure `useReducedMotion()` fallback
- **F6** Lighthouse pass — `npm run build && npm run start`, run Lighthouse in Chrome DevTools, fix any LCP/CLS regressions

Commit after each.

---

## Phase G — Launch polish

### Task G1: Type-check pass

- [ ] Run: `npx tsc --noEmit`
- [ ] Fix any errors

### Task G2: Build pass

- [ ] Run: `npm run build`
- [ ] Fix any build errors or warnings worth fixing

### Task G3: Cross-browser smoke

- [ ] Test in Chrome (latest), Firefox (latest), Safari (latest), mobile Safari, mobile Chrome
- [ ] Verify KOKA mark, rail, transitions render correctly
- [ ] Verify reduced-motion path on each

### Task G4: Accessibility pass

- [ ] Keyboard nav (tab through rail, arrow keys for prev/next)
- [ ] Screen reader test (VoiceOver)
- [ ] Focus ring visibility on all interactive elements

### Task G5: Final design review

- [ ] Walk through all 28 concepts at a steady pace
- [ ] Note any layout / type / motion inconsistencies
- [ ] Fix and commit

### Task G6: Tag release

```bash
git -C /Users/pavankurmarao.k/Documents/personal/web-internals tag v2.0.0-design-d
```

---

## Self-Review Notes

Spec coverage check:
- ✓ Goal & mental model — Phase A foundations + journey structure
- ✓ 7-step IA — Phases B (data), C (routes)
- ✓ Visual identity Direction D — Phase A (tokens, fonts), Phase D (component application)
- ✓ Typography — Tasks A1, A2; applied in D, E
- ✓ Color system — Task A2
- ✓ KOKA mark — Task A3
- ✓ Layout system (rail, hairline, single column) — Tasks A5, B3, B4
- ✓ Components refactored — Phase D
- ✓ New components — Phase A, B
- ✓ Motion primitives — Task A4
- ✓ Animation polish (10 targets) — Phase F
- ✓ Content port (11 new concepts) — Phase E
- ✓ Migration / routing — Phase C
- ✓ Future-tutorial seed — already committed

Placeholders check: Phase D2-D6 and Phase E2-E13 are templated rather than fully spelled out — they're repetitive applications of the same pattern established in D1 and E1. Each will be executed against the spec at the time. This is intentional plan compactness; the patterns are precise.

---

## Execution Note

User granted blanket approval and stepped away. Auto-selecting **Subagent-Driven execution**: dispatch a fresh subagent per task, two-stage review between tasks, fast iteration. Subagents work on the web-internals project at `/Users/pavankurmarao.k/Documents/personal/web-internals`.

Progress logged to `docs/superpowers/AUTONOMOUS-LOG.md`.
