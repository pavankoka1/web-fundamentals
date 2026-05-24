# Beyond the First Frame

_A future tutorial site on browser runtime internals._

This document captures topics that **don't** fit the strict "URL → pixels" linear journey of `web-internals`, but deserve their own deep-dive tutorial site. The journey ends when the first frame hits the screen — everything below begins *after* that moment.

Each entry includes a one-line hook describing what the topic teaches.

Source attributions:
- `hbr` — sibling project `how-browsers-render`
- `wf` — sibling project `web-fundamentals`
- `std` — standard references (web.dev, MDN, V8 docs, HTML spec)

---

## Section 00 — The Render Loop (navigation lens)

A 5-phase taxonomy that gives readers a shared map for *every* runtime topic that follows. Each entry in the rest of this tutorial lives somewhere on this loop, and the loop is the answer to "where am I in the pipeline right now?".

- **Phase 01 — Parsing & Tree Construction (runtime view)** — DOM/CSSOM mutation paths after first paint: `innerHTML`, `appendChild`, `adoptedStyleSheets`, declarative shadow DOM. What each path costs the parser at runtime. `hbr` `std`
  _Teaching hook:_ "Parsing isn't a one-time thing — every mutation re-enters the parser somewhere."
- **Phase 02 — Layout (runtime view)** — The reflow walk, what triggers it, where it can stop. Synchronous layout vs. scheduled layout. `hbr`
  _Teaching hook:_ "Reflow is a walk down the tree. Containment puts up walls."
- **Phase 03 — Paint (runtime view)** — Display-list re-recording, paint regions, dirty rects. What the painter actually does between two frames. `hbr`
  _Teaching hook:_ "Paint = building draw commands. It's not yet pixels."
- **Phase 04 — Commit & Compositing (runtime view)** — The handoff from main to compositor thread: what the commit copies, what stays. Layer/tile updates between frames. `hbr`
  _Teaching hook:_ "Commit is the moment main and compositor briefly hold hands."
- **Phase 05 — Display & Timing (runtime view)** — VSync, frame deadlines, the present step. Variable refresh rates, frame pacing. `hbr` `std`
  _Teaching hook:_ "The screen ticks on its own clock. Everything before this phase is just trying to keep up."

The five phases map directly to the Confluence Glossary's taxonomy (Parsing/Tree Construction, Layout, Paint, Commit & Compositing, Display & Timing). The rest of the sections below tag each topic with the phase it touches most.

---

## Section 01 — Updates & Invalidation

The browser optimizes for "what changed". Each pipeline stage tracks dirty work and re-does only what it must. Get this wrong and a small write triggers a cascade.

- **Style Invalidation** — A named mechanism, not a vibe. Blink's style invalidation set: which DOM mutations dirty which selectors, how the engine avoids re-walking siblings, where `:has()` complicates everything. `hbr`
  _Teaching hook:_ "Adding a class doesn't restyle the world — it dirties a set."
- **Layout Invalidation** — A named mechanism. Layout boundaries, `LayoutNG`'s sub-tree relayout, what propagates upward (intrinsic size changes) vs. stays local. `hbr`
  _Teaching hook:_ "Reflow walks. Where does the walk start, and where does it stop?"
- **Paint Invalidation** — Dirty rects, paint regions, repaint coalescing. The named mechanism behind why moving a single element doesn't repaint the page. `hbr`
  _Teaching hook:_ "Paint thinks in rectangles. Mutate one, repaint one — if you stayed in your layer."
- **Virtual DOM & Reconciliation** — React/Preact/Vue's strategy for figuring out "what changed" *before* talking to the browser. Diffing algorithms, keys, the cost model. Why the VDOM exists is the same reason invalidation sets exist: minimize the work crossing the boundary. `wf` `std`
  _Teaching hook:_ "The VDOM is a userland mirror of what the browser already does internally — and the seam between them is where most React perf bugs live."
- **Layout Thrashing** — Forced synchronous layout: the classic read-write-read-write loop that wrecks frame time. `hbr`
  _Teaching hook:_ "Every layout-reading API is a synchronization point. Read all, then write all."
- **Blast Radius** — How a single attribute change ripples through descendants — and the patterns that cap it. `hbr`
  _Teaching hook:_ "A mutation is a stone in a pond. Containment is the lake's edge."
- **Containment as a runtime primitive** — `contain: layout / paint / style / size` used not just for initial layout, but as a perf escape hatch under mutation. `hbr`
  _Teaching hook:_ "Containment is a promise to the browser: 'Nothing inside this box affects anything outside.'"

---

## Section 02 — Compositing Dynamics

After the first frame, the GPU's relationship with the DOM is constantly renegotiated. Layers grow, merge, multiply.

- **Layer Promotion** (runtime view) — `will-change`, 3D transforms, `position: fixed`: what actually triggers promotion at runtime, and what the cost of an extra layer actually is. `hbr`
  _Teaching hook:_ "Promotion isn't free. Every layer is a tax on memory and bandwidth."
- **Layer Squashing** — When the compositor merges adjacent layers to keep memory in check, and the surprising visual artifacts that can emerge (z-order shuffles, blur bleed). `hbr`
  _Teaching hook:_ "The compositor will marry two layers behind your back if you give it a reason."
- **Layer Explosion** — The anti-pattern: ten thousand promoted layers, GPU starvation. How to detect and tame it via the Layers panel. `hbr`
  _Teaching hook:_ "Every `will-change: transform` on a list item compounds. The fix is rarely 'more will-change'."
- **Composite After Paint (CAP)** — Chrome's new compositing architecture. Why it exists, what it changes, what stays the same. `hbr`
  _Teaching hook:_ "Old model: paint per layer. New model: paint once, composite anything."
- **"Compositing failed" reasons** (the three failure modes) — DevTools' "compositing failed" message has at least three flavors, each with a different fix:
  1. _Non-compositable property animated_ — animating `top`/`left`/`width` instead of `transform`. The layer falls back to main-thread paint every frame.
  2. _Layer too large_ — exceeds the GPU's maximum texture size; the layer is split or refused.
  3. _Property tree mismatch_ — a transform/clip/effect node can't be expressed on the compositor side, so the layer is composited on main.
  `hbr` `std`
  _Teaching hook:_ "DevTools is whispering; learn the three flavors and the message becomes legible."
- **GPU memory pressure & tile eviction** — When the GPU evicts tiles, what re-rasterization costs you (checkerboarding on fast scroll). `hbr`
  _Teaching hook:_ "Tiles aren't immortal. Evicted ones come back as gray rectangles."

---

## Section 03 — Interaction & Input

The browser's response loop. From pointer to paint, with all the threads it has to cross.

- **Hit Testing** — How the browser figures out what you clicked. The hit-test tree is rebuilt as layers shift, and `mousemove` is the chatty event that exercises it 60+ times a second. Why complex stacking contexts make hit-testing expensive — and why `pointer-events: none` on decorative overlays is the single biggest input-perf win you can ship. `hbr`
  _Teaching hook:_ "Every mousemove asks 'who am I over?' The answer is more expensive than it looks."
- **Chatty mousemove & input throttling** — `mousemove`/`pointermove` fire at the device's poll rate (often 1000Hz on modern mice). What the browser does to coalesce, what your listeners cost, when `requestAnimationFrame`-throttling is the right shape. `hbr` `std`
  _Teaching hook:_ "Your mouse is louder than your monitor. Coalesce, or you'll process 16 events to paint one frame."
- **Event Targeting, Capture & Bubbling** — The three-phase event model, and where the browser cuts corners. `wf` `std`
  _Teaching hook:_ "The DOM doesn't really 'bubble'. It walks a list, twice."
- **Pointer Events & Passive Listeners** — Unified input, scroll-blocking gotchas, the `{ passive: true }` contract. `std`
  _Teaching hook:_ "A non-passive scroll listener can hold the compositor hostage for 100ms."
- **requestAnimationFrame mechanics** — Where rAF sits in the HTML rendering steps; what runs before/after; the rAF starvation pattern. The primitive for "I want to do work right before the next paint". `hbr` `std`
  _Teaching hook:_ "rAF isn't a timer. It's a hook into the render pipeline."
- **INP (Interaction to Next Paint)** — The Core Web Vital that replaced FID. What it measures, how it's computed, how to optimize. `hbr` `std`
  _Teaching hook:_ "FID asked when you started. INP asks when you finished."
- **Scheduling & `scheduler.postTask`** — The new browser-native task scheduler. Priorities, yielding, breaking up long tasks. `std`
  _Teaching hook:_ "If your task is 60ms long, the browser's solution is: don't be."

---

## Section 04 — The JavaScript Runtime

V8 (and friends) in their own right — the engine that powers everything *between* the first paint and the next one.

- **V8 architecture: Ignition + TurboFan** — The interpreter and the optimizing JIT. When code gets hot, what it costs to deoptimize. `wf` `std`
- **Hidden classes & inline caches** — Why object shape stability matters; megamorphic vs monomorphic call sites. `std`
- **The Event Loop (deep)** — Task queues vs microtask queues, the HTML spec's rendering steps, where rAF/rIC live. `hbr` `wf`
- **Execution Context, Scopes & the Variable Environment** — How JavaScript actually finds your variables. `wf`
- **Closures (under the hood)** — Why they exist, how V8 implements them, the gotchas (leaks, hidden references). `wf`
- **Prototypes & Inheritance** — Prototype chains, `__proto__` vs `prototype`, hidden class transitions. `wf`
- **Garbage Collection** — Young/old generation, write barriers, when GC pauses cost you frames. `std`

---

## Section 05 — Concurrency & Off-Main-Thread

The web's growing multi-threaded surface area.

- **Web Workers** — Real threads, `postMessage`, structured clone, transferable objects. `wf` `std`
- **SharedArrayBuffer & Atomics** — Shared memory between workers (with cross-origin isolation). `std`
- **OffscreenCanvas** — Drawing from a worker thread, decoupling from main. `std`
- **Service Workers (advanced patterns)** — Strategies beyond cache-first: stale-while-revalidate, network-falling-back-to-cache, background sync, periodic sync. `wf`
- **Cross-Origin Isolation** — COOP/COEP, why some powerful features (SAB, high-res timers) require it. `std`

---

## Section 06 — Real-time Networking

The connections that stay open after the first page loads — the conversations the page keeps having with the server.

- **WebSockets** — Bidirectional persistent transport. Frames, ping/pong, back-pressure. `wf`
- **Server-Sent Events** — One-way push, simpler than WS, retry semantics. `wf`
- **WebRTC** — Peer-to-peer, ICE, STUN, TURN. Why the path is so weird. `std`
- **HTTP/2 multiplexing** — Streams, prioritization, head-of-line blocking. `wf`
- **HTTP/3 over QUIC** — UDP-based transport, 0-RTT, why HoL is gone (at the transport layer). `std`
- **WebTransport** — The new kid: HTTP/3-based, datagrams + streams. `std`

---

## Section 07 — Performance Measurement

You can't optimize what you can't see. The instruments and what they measure.

- **Core Web Vitals** — LCP, INP, CLS — what each one means, what it doesn't capture. `std`
- **Frame budget edge cases** — Variable refresh rate (VRR), long-frame symptoms, scroll-driven animations. `hbr`
- **Jank patterns** — Common shapes of jank in flame charts; the root cause behind each. `hbr`
- **Reading the DevTools Performance panel** — Flame chart literacy: main thread, compositor thread, raster threads, GPU. `hbr`
- **User Timing & PerformanceObserver** — Custom instrumentation; mark/measure semantics. `std`
- **Lighthouse vs RUM** — Lab vs field; when each lies; how to use both. `std`

---

## Section 08 — DevTools Literacy (meta-topic)

A first-class section, not an afterthought. The Confluence Glossary ties every concept back to a specific DevTools panel/marker — this section makes the *tool* the lens. Every other topic in this tutorial gets a "where this shows up in DevTools" pointer back to here.

- **The Performance panel as a map** — Reading the flame chart top-to-bottom: main thread, compositor, raster, GPU. Which row matters for which question. `hbr` `std`
  _Teaching hook:_ "The flame chart isn't a stack — it's four parallel time-tracks. Learn to read them as a chord."
- **Layers panel** — Where layer promotion, squashing, and explosion become visible. The diagnostic for compositing decisions. `hbr` `std`
  _Teaching hook:_ "If you can't see your layers, you can't reason about them."
- **Rendering panel** — Paint flashing, layer borders, FPS meter, scroll-perf overlay, Core Web Vitals overlay. The runtime ergonomics dashboard. `hbr` `std`
  _Teaching hook:_ "Paint flashing turns invisible re-paints visible."
- **Performance Insights** — The newer panel that surfaces named diagnostics ("Forced reflow", "Long task", "Render-blocking request"). The bridge from flame chart to actionable advice. `std`
  _Teaching hook:_ "Insights is DevTools telling you what to do, instead of just what happened."
- **Memory panel** — Heap snapshots, retainers, the GC story. Where leaks show up. `wf` `std`
  _Teaching hook:_ "Every leak is a retainer chain. The panel shows you the chain."
- **Coverage panel** — Unused CSS/JS at runtime. Where dead bytes hide. `std`
  _Teaching hook:_ "Coverage is the difference between what you ship and what you use."
- **Performance markers reference** — A canonical mapping: "Recalculate Style", "Layout", "Update Layer Tree", "Composite Layers", "Paint", "Rasterize" — what each marker means and which pipeline phase it lives in. The Rosetta stone that ties the flame chart back to the Render Loop taxonomy. `hbr` `std`
  _Teaching hook:_ "Every marker is a phase. Learn the dictionary once; read every trace."

---

## Confluence Glossary alignment

This sibling tutorial maps cleanly to the 5-phase taxonomy used by the Confluence Glossary that grew out of `web-internals`:

| Confluence phase             | Sibling-site sections that touch it                  |
| ---------------------------- | ---------------------------------------------------- |
| Parsing & Tree Construction  | Section 01 (Updates & Invalidation)                  |
| Layout                       | Section 01 (Layout Invalidation, Thrashing), Section 02 (when layer trees rebuild) |
| Paint                        | Section 01 (Paint Invalidation), Section 02 (Composite After Paint) |
| Commit & Compositing         | Section 02 (Compositing Dynamics — primary home)     |
| Display & Timing             | Section 03 (rAF, INP), Section 07 (frame budget)     |

The mapping isn't 1:1 — sibling sections are organized around *runtime activities* (invalidation, compositing dynamics, interaction) rather than pipeline phases, but each runtime activity lives somewhere on the loop. Section 00 ("The Render Loop") is the cross-reference: every other section links back to it for "where am I in the pipeline?"

The Confluence Glossary, in turn, references this tutorial for the "what happens *between* frames" stories that don't fit a linear journey.

---

## Suggested site identity

Some candidate names for the future site:

- **"Beyond the First Frame"** — direct, references the journey it follows
- **"Browser at Runtime"** — what the site is, plainly
- **"After Pixels Hit Glass"** — poetic, sets the moment-of-arrival
- **"The Browser's Second Act"** — narrative framing
- **"Live Internals"** — short, technical

## Suggested structure

If it follows the same Direction D system as `web-internals`, the natural shape mirrors the runtime loop rather than a linear journey:

```
00 — The Render Loop                (navigation lens — 5-phase taxonomy)
01 — Updates & Invalidation         (DOM changes → pipeline ripples)
02 — Compositing Dynamics           (layers evolving over time)
03 — Interaction & Input            (pointer → paint)
04 — The JavaScript Runtime         (V8 in depth)
05 — Concurrency & Off-Main-Thread  (workers, isolation)
06 — Real-time Networking           (persistent connections)
07 — Performance Measurement        (instruments)
08 — DevTools Literacy              (meta-topic — every other section links here)
```

Same KOKA brand mark. Same Source Serif 4 + Geist Sans system. Same ice-cyan accent. Two sites, one identity, one continuous learning arc — first frame, then everything after.

---

_Generated during web-internals tutorial restructure brainstorm. The cut topics from the URL→pixels journey are the seed for this future site._
