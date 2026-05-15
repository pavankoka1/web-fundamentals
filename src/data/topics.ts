import type { Phase } from '@/lib/phaseColors'

export interface Topic {
  id: string
  phase: Phase
  order: number
  title: string
  subtitle: string
  example: string
  facts: [string, string][]
  insight: string
  diagramKey: string
  sceneKey: string
  seoDescription: string
  codeDemo?: { bad: string; good: string; label: string }
}

export const topics: Topic[] = [
  {
    id: 'url-parsing',
    phase: 'Network',
    order: 1,
    title: 'URL Parsing',
    subtitle: 'The browser dissects the address before anything touches the network',
    example: `You type: https://api.github.com/users/torvalds?tab=repos#about

• scheme: https — browser checks HSTS preload list (~130k domains baked into binary). If listed, http:// is silently upgraded before DNS.
• host: api.github.com — will trigger DNS. Unicode hostnames encoded as Punycode (RFC 3492).
• path + query: /users/torvalds?tab=repos — sent verbatim to server in HTTP request line.
• fragment: #about — stripped before any network request. Server never sees it. Lives only in window.location.hash.`,
    facts: [
      ['Parser', 'WHATWG URL Standard — 80+ state machine transitions'],
      ['HSTS preload', 'Built into Chrome/Firefox binary — no network request needed'],
      ['Fragment', 'Stripped before HTTP. Lives in window.location.hash only'],
      ['Punycode', 'münchen.de → xn--mnchen-3ya.de (RFC 3492)'],
      ['Default ports', 'HTTP:80, HTTPS:443 — omitted from Host header'],
      ['javascript: scheme', 'Valid URL, parsed fine — browsers must explicitly block it'],
    ],
    insight: `The fragment is NEVER transmitted to the server — this is why SPAs can use hash-based routing (#/about) as a zero-server-round-trip navigation. The WHATWG URL parser is intentionally more permissive than RFC 3986 for web compatibility reasons.`,
    diagramKey: 'url',
    sceneKey: 'url',
    seoDescription: 'How browsers parse URLs: WHATWG URL Standard, HSTS preload lists, Punycode encoding, and why URL fragments never reach the server.',
  },
  {
    id: 'dns-resolution',
    phase: 'Network',
    order: 2,
    title: 'DNS Resolution',
    subtitle: 'Converting a hostname into an IP address via a layered cache chain',
    example: `Resolving api.github.com:
1. Browser DNS cache: miss (not seen recently)
2. OS cache + /etc/hosts: miss
3. Recursive resolver (8.8.8.8 or 1.1.1.1): miss — starts iterative resolution
4. Root nameserver (a.root-servers.net): "ask .com TLD server"
5. .com TLD nameserver: "ask ns1.github.com"
6. GitHub authoritative NS returns A record: 140.82.114.5, TTL=60

Total cold resolution: ~80ms. Answer cached at every level up to TTL.`,
    facts: [
      ['TTL', 'Controls cache lifetime. Low = fresh but slower. High = fast but slow propagation.'],
      ['Negative caching', 'NXDOMAIN is cached too — per SOA negative TTL. Fixing a typo takes time.'],
      ['DoH', 'RFC 8484: DNS over HTTPS — encrypts queries, prevents ISP snooping'],
      ['DNSSEC', 'Cryptographic chain-of-trust on records — authentication, not encryption'],
      ['Root servers', '13 logical names, 1,600+ anycast instances globally'],
      ['Chrome DNS cache', 'Independent of OS — inspectable at chrome://net-internals/#dns'],
    ],
    insight: `Browser DNS cache is completely independent of the OS resolver. Chrome keeps its own cache, inspectable at chrome://net-internals/#dns. Flushing the OS DNS cache does absolutely nothing to Chrome's internal cache. This trips up nearly every developer when testing DNS changes.`,
    diagramKey: 'dns',
    sceneKey: 'dns',
    seoDescription: 'How DNS resolution works: the 5-level cache chain from browser to authoritative nameserver, TTLs, DoH, DNSSEC, and why Chrome has its own DNS cache.',
  },
  {
    id: 'tcp-connection',
    phase: 'Network',
    order: 3,
    title: 'TCP Connection',
    subtitle: 'The 3-way handshake establishes a reliable ordered byte stream',
    example: `Client at 192.168.1.5 connects to Server at 140.82.114.5:443

• SYN:     client sends seq=1234567 (random ISN), syn=1
• SYN-ACK: server replies seq=9876543, ack=1234568 (x+1)
• ACK:     client sends ack=9876544 (y+1) — connection open

Cost: 1 full RTT before TLS even starts.
At 50ms RTT = 50ms wasted. HTTP/3 over QUIC eliminates this entirely.`,
    facts: [
      ['ISN', 'Initial Sequence Number is random — prevents port reuse collisions and some spoofing'],
      ['HOL blocking', 'HTTP/1.1 must return responses in order. HTTP/2 fixes with multiplexed streams.'],
      ['CUBIC', 'Default Linux congestion control — optimised for high-bandwidth, high-latency links'],
      ['BBR', "Google's modern congestion control: models bottleneck bandwidth, reacts to delay not loss"],
      ['QUIC', 'HTTP/3: TCP replaced by QUIC over UDP. Eliminates handshake + TLS RTT overhead.'],
      ['TIME_WAIT', '2×MSL post-close: up to 4 minutes. Can exhaust ephemeral ports under high churn.'],
    ],
    insight: `Slow Start is why the first ~14KB of a page loads faster than the rest: initial cwnd = 10 MSS (~14KB). Server-side rendering HTML pages under 14KB delivers dramatically better perceived performance because the entire HTML fits in the first TCP congestion window.`,
    diagramKey: 'tcp',
    sceneKey: 'tcp',
    seoDescription: 'How TCP 3-way handshake works: SYN/SYN-ACK/ACK sequence, slow start, congestion control (CUBIC, BBR), and why HTTP/3 QUIC eliminates this RTT.',
  },
  {
    id: 'tls-handshake',
    phase: 'Network',
    order: 4,
    title: 'TLS 1.3 Handshake',
    subtitle: 'Authenticated encryption negotiated in a single round trip',
    example: `1. Client sends ClientHello: TLS 1.3, AES-256-GCM, ECDHE key share (Curve25519 public key)
2. Server replies in one flight: ServerHello + X.509 certificate + ECDHE public key + digital signature + Finished
3. Client verifies cert chain against trusted CA roots, derives session key from ECDHE shared secret, sends Finished
4. Application data flows over the symmetric session key.

TLS 1.3: 1 RTT. TLS 1.2: 2 RTT. QUIC 0-RTT: zero RTT for resumption (replay-attack risk).`,
    facts: [
      ['Cipher suites', 'TLS 1.3 removed all weak suites. All remaining provide forward secrecy.'],
      ['ECDHE', 'Elliptic Curve Diffie-Hellman Ephemeral. Curve25519 provides ~128-bit security.'],
      ['OCSP stapling', 'Server attaches signed revocation status — client avoids extra CA round-trip'],
      ['CT logs', 'Certificate Transparency (RFC 6962): all certs must be logged. Chrome enforces.'],
      ['0-RTT', 'Session resumption with zero RTT. Risk: replay attacks. Safe only for idempotent GETs.'],
      ['SNI', 'Server Name Indication: hostname in ClientHello so one IP can serve many TLS certs'],
    ],
    insight: `Certificate Transparency (CT) is why Google caught Symantec mis-issuing certificates in 2017. Every certificate must appear in a public, append-only log before Chrome trusts it. This shifted PKI from "trust us" to "prove it, publicly, forever."`,
    diagramKey: 'tls',
    sceneKey: 'tls',
    seoDescription: 'How TLS 1.3 handshake works in 1 RTT: ECDHE key exchange, certificate verification, forward secrecy, and Certificate Transparency logs.',
  },
  {
    id: 'http-protocol',
    phase: 'Network',
    order: 5,
    title: 'HTTP Protocol',
    subtitle: 'Request/response format and the evolution from 1.1 to 3',
    example: `GET /users/torvalds HTTP/1.1
Host: api.github.com
Authorization: Bearer ghp_xxx
Accept: application/vnd.github.v3+json

HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: max-age=60
X-RateLimit-Remaining: 58

{"login":"torvalds","id":1024,...}`,
    facts: [
      ['HTTP/1.1 HOL', 'Browsers open 6 parallel connections per origin as a head-of-line blocking workaround'],
      ['HTTP/2 HPACK', 'Header compression: static+dynamic tables. 800-byte headers → ~50 bytes on repeats'],
      ['103 Early Hints', 'Server sends preload hints before final response. Replaced Server Push.'],
      ['Server Push', 'Deprecated in Chrome 2022 — pushed already-cached resources, wasting bandwidth'],
      ['Status codes', '1xx info, 2xx success, 3xx redirect, 4xx client error, 5xx server error'],
      ['HTTP/3 QUIC', 'UDP-based: 0-RTT, per-stream retransmission, connection migration (WiFi → LTE)'],
    ],
    insight: `HTTP/2 Server Push failed because the server cannot know what is in the client's cache. 103 Early Hints fixes this: the server sends a 103 informational response with Link: preload headers, and the browser decides whether to fetch — because it already knows its cache state.`,
    diagramKey: 'http',
    sceneKey: 'http',
    seoDescription: 'How HTTP/1.1, HTTP/2, and HTTP/3 work: request/response format, HPACK compression, multiplexing, QUIC, and why Server Push was deprecated.',
  },
  {
    id: 'html-parsing',
    phase: 'Browser',
    order: 6,
    title: 'HTML Parsing → DOM',
    subtitle: 'Bytes stream in, the tokenizer builds the tree incrementally',
    example: `Parser encounters: <link rel="stylesheet" href="app.css">
  — Blocks rendering (CSS is render-blocking)
  — BUT preload scanner fires fetch for app.css immediately

Parser encounters: <script src="app.js"> (no async/defer)
  — Parser STOPS completely
  — Script fetched + executed
  — Parser resumes after execution

async: fetch in parallel, execute immediately (may run before DOMContentLoaded)
defer: fetch in parallel, execute in order after HTML parsed, before DOMContentLoaded`,
    facts: [
      ['Parser blocking', '<script> without async/defer halts tokenization until execution completes'],
      ['async', 'Fetch parallel, execute as-downloaded. Unordered. May fire before DOMContentLoaded.'],
      ['defer', 'Fetch parallel, execute in source order after parse, before DOMContentLoaded'],
      ['Preload scanner', 'Lookahead: fires fetches for link, img, script src while parser is blocked'],
      ['DOMContentLoaded', 'HTML parsed + deferred scripts done. NOT waiting for images, fonts, CSS.'],
      ['load event', 'Everything fully loaded: images, stylesheets, subframes, fonts'],
    ],
    insight: `The preload scanner is one of the highest-impact browser optimisations ever built. Without it, a single render-blocking script would stall ALL resource fetching. In DevTools waterfall, resources begin loading while the parser is blocked — that is the preload scanner firing. Firefox calls it "speculative parsing."`,
    diagramKey: 'html',
    sceneKey: 'html',
    seoDescription: 'How browsers parse HTML into the DOM: the tokenizer, parser blocking scripts, async vs defer, preload scanner, and DOMContentLoaded vs load.',
  },
  {
    id: 'css-parsing',
    phase: 'Browser',
    order: 7,
    title: 'CSS Parsing → CSSOM',
    subtitle: 'Cascade resolution: which declaration wins for each property on each element',
    example: `For element <p class="text" id="intro">:

Rule 1: p { color: gray }          — specificity (0,0,0,1)
Rule 2: .text p { color: red }     — specificity (0,0,1,1) — class + element
Rule 3: #intro { color: blue }     — specificity (0,1,0,0) — ID wins!

Final computed value: color: blue

ALL external CSS blocks rendering — full CSSOM must be built before layout.`,
    facts: [
      ['Specificity', '(inline, IDs, classes/attrs/pseudoclasses, elements) — compared left to right'],
      ['Source order', 'Equal specificity? Last declaration wins. This is the "C" in CSS.'],
      ['!important', 'Overrides all normal declarations — but higher-spec !important still wins'],
      ['Custom properties', '--foo: bar — cascades and inherits like any property'],
      ['@layer', 'CSS Cascade Layers (2022): explicit cascade order without specificity hacks'],
      ['Right-to-left', 'Selector matching runs right-to-left. * (universal) is most expensive.'],
    ],
    insight: `Selector matching runs RIGHT-TO-LEFT. For "div p span": browser finds all span elements, checks if parent is p, checks if ancestor is div. The universal selector * is the most expensive — every element is a candidate. CSS Cascade Layers (@layer, 2022) is the biggest cascade change in a decade.`,
    diagramKey: 'css',
    sceneKey: 'css',
    seoDescription: 'How browsers parse CSS and build the CSSOM: cascade, specificity (inline/ID/class/element), right-to-left selector matching, and CSS Cascade Layers.',
  },
  {
    id: 'render-tree',
    phase: 'Render',
    order: 8,
    title: 'Render Tree',
    subtitle: 'DOM + CSSOM merge: only visible nodes receive layout boxes',
    example: `DOM node: <div class="hidden" style="display:none">...</div>
  — CSSOM computes display:none
  — EXCLUDED from render tree (no box, no space, no paint)

DOM node: <div style="visibility:hidden">...</div>
  — INCLUDED in render tree
  — Occupies space, generates box, painted transparent

CSS ::before / ::after pseudo-elements:
  — EXIST in render tree, NOT in DOM`,
    facts: [
      ['display:none', 'Excluded from render tree — no layout box, no space, no paint'],
      ['visibility:hidden', 'Included — occupies space, transparent. Hides without layout shift.'],
      ['Pseudo-elements', '::before, ::after exist in render tree but not in the DOM'],
      ['Anonymous boxes', 'Browser creates implicit wrappers per CSS spec (e.g. text node in a table)'],
      ['Stacking contexts', 'z-index, opacity<1, transform, filter all create new stacking contexts'],
      ['content-visibility', 'content-visibility:auto (Chrome 85+) skips subtree render for off-screen elements'],
    ],
    insight: `Toggling display:none to display:block is the most expensive show/hide operation — it forces render tree reconstruction. For animations, use visibility + opacity instead. content-visibility:auto on long scrolling lists cuts layout time by 50%+ by lazily constructing the render tree.`,
    diagramKey: 'rt',
    sceneKey: 'renderTree',
    seoDescription: 'How the browser builds the Render Tree by merging DOM and CSSOM: display:none vs visibility:hidden, pseudo-elements, stacking contexts, and content-visibility.',
  },
  {
    id: 'layout-reflow',
    phase: 'Render',
    order: 9,
    title: 'Layout (Reflow)',
    subtitle: 'Computing exact geometry — position, size, and box model for every node',
    example: `Forced Synchronous Layout — the #1 layout performance killer:

// BAD: FSL on every loop iteration (N reflows)
for (const el of items) {
  el.style.width = container.offsetWidth + 'px'  // READ forces flush
  el.className = 'wide'                           // WRITE invalidates
}

// GOOD: batch reads then writes (1 reflow total)
const w = container.offsetWidth   // one read
for (const el of items) el.style.width = w + 'px'`,
    facts: [
      ['BFC', 'Block Formatting Context: contains floats, prevents margin collapse leaking'],
      ['FSL', 'Forced Synchronous Layout: write DOM then immediately read layout property = reflow'],
      ['Containing block', 'Determines % sizes — set by nearest positioned/transformed ancestor'],
      ['Layout thrashing', 'Read-write-read-write loop = FSL × N. Fix: batch all reads, then all writes.'],
      ['contain:layout', 'CSS containment: limits reflow scope to subtree, avoids full-page reflow'],
      ['getBoundingClientRect', 'Forces layout flush if DOM has been written since last frame.'],
    ],
    insight: `getBoundingClientRect(), offsetWidth, offsetHeight, scrollTop — ALL force a layout flush if the DOM has been modified since the last frame. In Chrome DevTools Performance panel, look for purple "Layout" bars triggered mid-frame. The fix is always: batch all reads before writes.`,
    diagramKey: 'layout',
    sceneKey: 'layout',
    seoDescription: 'How browser layout (reflow) works: CSS box model, forced synchronous layout (FSL), layout thrashing, and how to batch DOM reads and writes for 60fps.',
    codeDemo: {
      bad: `// Layout thrashing: N reflows
for (const el of items) {
  // READ forces layout flush ↓
  const w = container.offsetWidth
  // WRITE invalidates layout ↑
  el.style.width = w + 'px'
}`,
      good: `// Batch: 1 read, then N writes
const w = container.offsetWidth   // single read

for (const el of items) {
  el.style.width = w + 'px'   // write only
}`,
      label: 'Layout Thrashing vs Batched Reads',
    },
  },
  {
    id: 'paint',
    phase: 'Render',
    order: 10,
    title: 'Paint',
    subtitle: 'Building display lists — drawing commands, not pixels yet',
    example: `After layout, browser traverses stacking contexts in paint order:
1. Background (background-color, background-image)
2. Borders
3. Float children
4. Inline content (text, replaced elements like img)
5. Outlines

Elements with transform, opacity, will-change are promoted to compositor layers —
they get their own display list and bypass repaint during animation.`,
    facts: [
      ['Display list', 'Serialisable drawing commands: drawRect, fillText, drawImage. Not pixels yet.'],
      ['Dirty regions', 'Only changed element bounding rects are repainted, not the whole page'],
      ['will-change', 'Pre-promotes element to compositor layer before animation starts'],
      ['box-shadow', 'Cannot GPU-accelerate — forces large dirty rect. Use filter:drop-shadow instead.'],
      ['Tile rasterisation', 'Painted layers rasterised in 256×256 or 512×512 tiles'],
      ['Layer count', 'Too many layers = GPU VRAM exhaustion = blank tiles. Profile in DevTools > Layers.'],
    ],
    insight: `box-shadow with large blur is one of the most expensive CSS properties — it generates a massive dirty rect that must be software-rasterised every frame. For animated shadows: use filter:drop-shadow (GPU-accelerated) or animate the opacity of a ::after pseudo-element with a pre-rendered shadow.`,
    diagramKey: 'paint',
    sceneKey: 'paint',
    seoDescription: 'How browser paint works: display lists, dirty region tracking, compositor layer promotion, will-change, box-shadow performance, and tile rasterisation.',
  },
  {
    id: 'compositing',
    phase: 'Render',
    order: 11,
    title: 'Compositing',
    subtitle: 'The GPU assembles promoted layers into the final frame at 60fps',
    example: `// JANK — triggers layout + paint every frame
@keyframes slide {
  from { left: 0 }
  to   { left: 400px }
}

// SMOOTH — compositor-only, no layout/paint
@keyframes slide {
  from { transform: translateX(0) }
  to   { transform: translateX(400px) }
}

Only transform and opacity are compositor-only.
Everything else triggers at minimum a repaint.`,
    facts: [
      ['GPU-only', 'transform + opacity: no layout, no paint. 60fps+ even with busy main thread.'],
      ['Layer memory', '1920×1080 × 4 bytes = 8.3 MB GPU VRAM per layer. Multiply by layer count.'],
      ['Compositor thread', 'Runs independent of JS main thread. JS jank does NOT affect composited animations.'],
      ['Main thread jank', 'Long JS task blocks commit to compositor → dropped frames'],
      ['Scroll compositing', 'Compositor handles scroll natively. Non-composited fixed elements force main thread.'],
      ['Layer explosion', '100 will-change:transform elements = 100 GPU layers. Can exhaust VRAM silently.'],
    ],
    insight: `React Concurrent Mode's scheduler uses postMessage (a macrotask) to yield between work chunks — each postMessage recipient is a separate macrotask, giving the browser compositor a chance to commit frames between React rendering increments. This is the mechanism behind "interruptible rendering" in React 18+.`,
    diagramKey: 'composite',
    sceneKey: 'compositing',
    seoDescription: "How GPU compositing works: compositor layers, transform/opacity fast path, layer memory cost, why JS jank drops frames, and React 18's concurrent scheduler.",
    codeDemo: {
      bad: `/* Triggers layout + paint every frame */
@keyframes slide {
  from { left: 0px }
  to   { left: 400px }
}

.box { position: relative; animation: slide 1s; }`,
      good: `/* Compositor-only: no layout, no paint */
@keyframes slide {
  from { transform: translateX(0) }
  to   { transform: translateX(400px) }
}

.box { animation: slide 1s; }`,
      label: 'Layout-triggering vs Compositor-only Animation',
    },
  },
  {
    id: 'javascript-engine',
    phase: 'Execute',
    order: 12,
    title: 'JavaScript Engine (V8)',
    subtitle: 'From source text to optimised machine code via two-tier compilation',
    example: `function add(a, b) { return a + b }

// After 1000 calls with numbers:
// TurboFan assumes a, b are always numbers
// Compiles: ADD rax, rbx (single CPU instruction)

// Type violation causes deoptimisation:
add('hello', 'world')
// TurboFan discards JIT code, falls back to Ignition

// Hidden class property order matters:
const a = {}; a.x = 1; a.y = 2   // C0 → C1 → C2
const b = {}; b.y = 1; b.x = 2   // Different order → C3 (cache miss!)`,
    facts: [
      ['Ignition', 'Bytecode interpreter — fast startup, runs all functions on first execution'],
      ['TurboFan', 'JIT compiler — activates for hot functions after type feedback from Ignition'],
      ['Inline caches', 'Monomorphic (1 type) = fastest. Polymorphic (2–4) = slower. Megamorphic (5+) = no opt.'],
      ['Hidden classes', 'Internal structural type per unique property order. Same shape = O(1) access.'],
      ['Orinoco GC', 'Generational: Scavenger for young gen (parallel, fast). Mark-Compact for old gen.'],
      ['Deopt', 'Type assumption violated → TurboFan discards JIT code, latency spike on hot path.'],
    ],
    insight: `The ORDER you define object properties matters for performance. Objects created with different property orders produce divergent hidden class chains — inline caches go megamorphic and V8 cannot optimise property access. Always define all properties in the constructor in the same order.`,
    diagramKey: 'v8',
    sceneKey: 'v8',
    seoDescription: 'How V8 JavaScript engine works: Ignition bytecode interpreter, TurboFan JIT compiler, hidden classes, inline caches, deoptimisation, and garbage collection.',
  },
  {
    id: 'event-loop',
    phase: 'Execute',
    order: 13,
    title: 'Event Loop',
    subtitle: 'Single-threaded concurrency via a precisely prioritised queue system',
    example: `// How many renders happen here?
async function example() {
  doSomething()            // sync
  await Promise.resolve()  // microtask checkpoint
  doMoreWork()            // still in microtask — no render yet!
}
// Zero renders! Microtasks drain to completion before render.

// To yield to the renderer:
await new Promise(r => setTimeout(r, 0))
// This queues a macrotask — render can happen before it fires`,
    facts: [
      ['Macrotasks', 'setTimeout, setInterval, MessageChannel, I/O, script loading. ONE per loop tick.'],
      ['Microtasks', 'Promise callbacks, queueMicrotask, MutationObserver. ALL drain before any render.'],
      ['rAF timing', 'requestAnimationFrame fires AFTER microtasks, BEFORE layout/paint. Ideal for DOM writes.'],
      ['Starvation', 'Infinite Promise chain blocks rendering forever. Use setTimeout(fn,0) to yield.'],
      ['Web Workers', 'Independent event loops. No shared memory by default; SharedArrayBuffer+Atomics for sharing.'],
      ['scheduler.yield()', 'scheduler.yield() (Chrome 115+) — explicit yield between long tasks'],
    ],
    insight: `Two await statements do NOT create two render opportunities — they create two microtask checkpoints. The renderer can only run between macrotasks. React's concurrent mode scheduler uses postMessage (macrotask) to yield between rendering chunks, allowing the browser to paint between React work segments.`,
    diagramKey: 'evloop',
    sceneKey: 'eventLoop',
    seoDescription: 'How the JavaScript event loop works: macrotask vs microtask queues, requestAnimationFrame timing, rendering pipeline, and how React 18 uses postMessage to yield.',
  },
  {
    id: 'http-caching',
    phase: 'Optimize',
    order: 14,
    title: 'HTTP Caching',
    subtitle: 'The right headers to eliminate every unnecessary network byte',
    example: `Optimal caching strategy:

// HTML files (can change any deploy):
Cache-Control: no-cache
// Revalidates every time, serves from cache on 304

// All other assets (content-hashed filenames):
Cache-Control: max-age=31536000, immutable
// bundle.a3b2c1.js — cached 1 year, never revalidated
// The HTML delivers updated fingerprints when assets change`,
    facts: [
      ['max-age', 'Seconds before stale. No request made within this window.'],
      ['immutable', 'Never revalidate. Use ONLY with content-hashed filenames.'],
      ['ETag', 'Server fingerprint. Browser sends as If-None-Match → 304 saves body transmission.'],
      ['stale-while-revalidate', 'Serve stale instantly + revalidate async. Zero latency with freshness.'],
      ['Vary', 'Cache key includes named headers. Vary: Accept-Encoding = separate copy per encoding.'],
      ['s-maxage', 'CDN-only TTL — overrides max-age for shared caches only, not browsers'],
    ],
    insight: `The most common caching mistake: setting a long max-age on the HTML file itself. The HTML is the delivery mechanism for content-hashed asset URLs. Give HTML no-cache (revalidates, serves from cache on 304) and give all other assets max-age=31536000, immutable.`,
    diagramKey: 'cache',
    sceneKey: 'cache',
    seoDescription: 'How HTTP caching works: Cache-Control headers, ETag/304 revalidation, stale-while-revalidate, content-hashed assets with immutable, and the optimal caching strategy.',
  },
  {
    id: 'cdn-edge',
    phase: 'Optimize',
    order: 15,
    title: 'CDN & Edge',
    subtitle: 'Anycast BGP routing delivers content from the nearest point of presence',
    example: `Without CDN: London user → US-East origin = 150ms RTT
With CDN:    London user → Frankfurt PoP = 8ms RTT

On cache miss: Frankfurt PoP → origin shield → US-East origin
Cache hit rate 95%+ means origin handles only 5% of traffic

Fastly Surrogate-Key purge:
Surrogate-Key: product-123
  — tags all product pages for instant global purge`,
    facts: [
      ['Anycast', 'Same IP, multiple BGP announcements. Routing directs user to nearest PoP automatically.'],
      ['Origin shield', 'Single upstream PoP coalesces all PoP cache misses → 1 origin request instead of 200.'],
      ['Surrogate-Key', 'Tag-based instant global purge (Fastly/Akamai). Essential for deploy invalidation.'],
      ['CloudFront', 'Takes 30 seconds to 5 minutes to propagate invalidation. Plan deploys accordingly.'],
      ['Edge compute', 'Cloudflare Workers, Fastly Compute: JS/Wasm at the PoP. Personalise without origin RTT.'],
      ['Cache hit ratio', 'Aim for >95%. miss_rate × origin_latency = effective added latency per request.'],
    ],
    insight: `Stale CDN cache after a bad deploy is one of the most common production incidents. Your deployment pipeline MUST include a tested, rehearsed cache purge step. Never deploy a breaking API change and a client asset change simultaneously without accounting for CDN propagation time.`,
    diagramKey: 'cdn',
    sceneKey: 'cdn',
    seoDescription: 'How CDNs work: anycast BGP routing, points of presence (PoPs), origin shield, Surrogate-Key cache purging, edge compute, and cache hit ratio optimisation.',
  },
  {
    id: 'service-workers',
    phase: 'Optimize',
    order: 16,
    title: 'Service Workers',
    subtitle: 'A programmable browser-native proxy for offline-first applications',
    example: `Cache-first strategy (static assets):
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request) || fetch(e.request)
  )
})

Network-first (API calls):
e.respondWith(
  fetch(e.request).catch(() => caches.match(e.request))
)

Stale-while-revalidate:
const cached = await caches.match(e.request)
e.respondWith(cached || fetch(e.request))`,
    facts: [
      ['Scope', 'SW intercepts all fetches within its registered URL path prefix only'],
      ['Cache API', 'Separate from HTTP cache. Programmatic key→value: Request → Response. Version names.'],
      ['Lifecycle', 'register → install (precache) → waiting → activate (cleanup) → controlling fetches'],
      ['Background Sync', 'Queue failed requests offline and replay when connectivity restores'],
      ['Push API', 'Receive push notifications from server even when page/browser is closed'],
      ['skipWaiting', 'Force new SW to activate immediately. Risky — can break active tabs.'],
    ],
    insight: `Service Worker cache invalidation is notoriously treacherous. A bug in a SW is served FROM the SW's own cache — if the bug prevents updates propagating, you can permanently brick all users on that origin. Always version cache keys (cache-v2, cache-v3). Use Workbox; never write SW cache logic by hand.`,
    diagramKey: 'sw',
    sceneKey: 'sw',
    seoDescription: 'How Service Workers work: fetch interception, cache strategies (cache-first, network-first, stale-while-revalidate), lifecycle, Push API, and safe cache versioning.',
  },
]

export const PHASES: Phase[] = ['Network', 'Browser', 'Render', 'Execute', 'Optimize']

export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find(t => t.id === slug)
}

export function getTopicsByPhase(phase: Phase): Topic[] {
  return topics.filter(t => t.phase === phase)
}

export function getAdjacentTopics(id: string): { prev: Topic | null; next: Topic | null } {
  const idx = topics.findIndex(t => t.id === id)
  return {
    prev: idx > 0 ? topics[idx - 1] : null,
    next: idx < topics.length - 1 ? topics[idx + 1] : null,
  }
}
