# Beyond the First Frame

_A future tutorial site on browser runtime internals._

This document captures topics that **don't** fit the strict "URL → pixels" linear journey of `web-internals`, but deserve their own deep-dive tutorial site. The journey ends when the first frame hits the screen — everything below begins *after* that moment.

Each entry includes a one-line hook describing what the topic teaches.

Source attributions:
- `hbr` — sibling project `how-browsers-render`
- `wf` — sibling project `web-fundamentals`
- `std` — standard references (web.dev, MDN, V8 docs, HTML spec)

---

## Section 01 — Updates & Invalidation

The browser optimizes for "what changed". Each pipeline stage tracks dirty work and re-does only what it must. Get this wrong and a small write triggers a cascade.

- **Style Invalidation** — How the engine marks style state dirty when the DOM/CSS mutates, and what walks the descendants. `hbr`
- **Layout Invalidation** — Which mutations force reflow, which propagate, and where the propagation stops. `hbr`
- **Paint Invalidation** — Dirty rects, paint regions, repaint coalescing. `hbr`
- **Layout Thrashing** — Forced synchronous layout: the classic read-write-read-write loop that wrecks frame time. `hbr`
- **Blast Radius** — How a single attribute change ripples through descendants — and the patterns that cap it. `hbr`
- **Containment as a runtime primitive** — `contain: layout / paint / style / size` used not just for initial layout, but as a perf escape hatch under mutation. `hbr`

---

## Section 02 — Compositing Dynamics

After the first frame, the GPU's relationship with the DOM is constantly renegotiated. Layers grow, merge, multiply.

- **Layer Promotion** (runtime view) — `will-change`, 3D transforms, `position: fixed`: what actually triggers promotion at runtime. `hbr`
- **Layer Squashing** — When the compositor merges adjacent layers to keep memory in check, and the surprising visual artifacts that can emerge. `hbr`
- **Layer Explosion** — The anti-pattern: ten thousand promoted layers, GPU starvation. How to detect and tame it. `hbr`
- **Composite After Paint (CAP)** — Chrome's new compositing architecture. Why it exists, what it changes, what stays the same. `hbr`
- **"Compositing Failed" reasons** — DevTools tells you it failed; here's how to read the message. `hbr`
- **GPU memory pressure & tile eviction** — When the GPU evicts tiles, what re-rasterization costs you. `hbr`

---

## Section 03 — Interaction & Input

The browser's response loop. From pointer to paint, with all the threads it has to cross.

- **Hit Testing** — How the browser figures out what you clicked, and why complex stacking contexts slow it down. `hbr`
- **Event Targeting, Capture & Bubbling** — The three-phase event model, and where the browser cuts corners. `wf` `std`
- **Pointer Events & Passive Listeners** — Unified input, scroll-blocking gotchas, the `{ passive: true }` contract. `std`
- **requestAnimationFrame mechanics** — Where rAF sits in the HTML rendering steps; what runs before/after; the rAF starvation pattern. `hbr`
- **INP (Interaction to Next Paint)** — The Core Web Vital that replaced FID. What it measures, how it's computed, how to optimize. `hbr` `std`
- **Scheduling & `scheduler.postTask`** — The new browser-native task scheduler. Priorities, yielding, breaking up long tasks. `std`

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
00 — The loop, in one picture       (overview)
01 — Updates & Invalidation         (DOM changes → pipeline ripples)
02 — Compositing Dynamics           (layers evolving over time)
03 — Interaction & Input            (pointer → paint)
04 — The JavaScript Runtime         (V8 in depth)
05 — Concurrency & Off-Main-Thread  (workers, isolation)
06 — Real-time Networking           (persistent connections)
07 — Performance Measurement        (instruments)
```

Same KOKA brand mark. Same Source Serif 4 + Geist Sans system. Same ice-cyan accent. Two sites, one identity, one continuous learning arc — first frame, then everything after.

---

_Generated during web-internals tutorial restructure brainstorm. The cut topics from the URL→pixels journey are the seed for this future site._
