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

export const PHASES = ['Network', 'Browser', 'Render', 'Execute', 'Optimize'] as const
export type PhaseType = typeof PHASES[number]

export const topics: Topic[] = [
  {
    id: 'url-parsing',
    phase: 'Network',
    order: 1,
    title: 'URL Parsing',
    subtitle: 'The browser reads your address like a map before taking a single step',
    example: `You type: https://api.github.com/users/torvalds?tab=repos#about

The browser splits this into pieces — before anything goes to the network:

• https — the protocol (how to talk). Browsers have a built-in list of ~130,000 sites that must always use secure HTTPS, even if you typed http://. GitHub is on that list.
• api.github.com — the address. This is what gets looked up in DNS next.
• /users/torvalds?tab=repos — the path and filters, sent as-is to GitHub's server.
• #about — this part never leaves your browser. The server never sees it. It just tells the browser to scroll to a section called "about".

The split happens in milliseconds, entirely in memory. No network yet.`,
    facts: [
      ['The #fragment rule', 'The part after # is stripped before any request. Servers never see it — that\'s why single-page apps can use #/routes without a server.'],
      ['HSTS preload list', '~130,000 domains baked into every Chrome and Firefox binary. Upgrading http→https happens before DNS, no network needed.'],
      ['Punycode encoding', 'Non-ASCII domains like münchen.de get encoded to xn--mnchen-3ya.de so old DNS servers can handle them.'],
      ['Default ports', 'http:// implies port 80, https:// implies 443. Browsers omit them from the request.'],
      ['URL state machine', 'The WHATWG URL parser has 80+ states — intentionally lenient to match real-world messy URLs.'],
      ['javascript: scheme', 'Technically a valid URL. Browsers parse it fine — but then explicitly block execution from the address bar.'],
    ],
    insight: `The #fragment trick is why single-page apps work without server changes: navigate to /dashboard#settings and the server only sees /dashboard. The client reads window.location.hash and renders the settings panel. Zero server round-trips for in-page navigation.`,
    diagramKey: 'url',
    sceneKey: 'url',
    seoDescription: 'How browsers parse URLs: WHATWG URL Standard, HSTS preload lists, Punycode encoding, and why URL fragments never reach the server.',
  },
  {
    id: 'dns-resolution',
    phase: 'Network',
    order: 2,
    title: 'DNS Resolution',
    subtitle: 'Turning a website name into the actual address your computer can connect to',
    example: `You want api.github.com. Your computer knows names, not addresses — so it asks around:

1. Browser's own memory: "Have I looked this up recently?" — No.
2. Your computer's local list: also nothing.
3. Your internet provider's lookup service (or 8.8.8.8 if you use Google's): "I don't know either, let me find out."
4. That helper asks the internet's master directory: "Who handles .com names?"
5. The .com registry says: "GitHub manages their own names. Ask them."
6. GitHub's own name server answers: "That's 140.82.114.5. This answer is good for 60 seconds."

The answer flows back and gets saved at every step — so next time it's instant.
Cold first lookup: ~80ms. From cache: under 1ms.`,
    facts: [
      ['Freshness timer (TTL)', 'Each DNS answer has an expiry. Low = always fresh but slow. High = fast but DNS changes take time to spread.'],
      ['Negative caching', 'Even "this domain doesn\'t exist" gets cached. Fixing a typo in a domain name can take hours to propagate.'],
      ['Encrypted DNS (DoH)', 'RFC 8484: DNS queries over HTTPS. Without it, your internet provider can see every site name you look up.'],
      ['DNSSEC', 'Adds digital signatures to DNS answers — proves the answer wasn\'t tampered with in transit. Doesn\'t encrypt, just authenticates.'],
      ['Root name servers', '13 names, but ~1,600 physical machines worldwide handling the same job via anycast routing.'],
      ['Chrome\'s own DNS cache', 'Completely separate from your OS. Flushing your system DNS does nothing to Chrome. Check chrome://net-internals/#dns.'],
    ],
    insight: `Chrome keeps its own DNS cache, completely separate from your operating system's. This trips up almost every developer the first time they test a DNS change: they flush the system cache, reload Chrome, and nothing changes — because Chrome is still serving its own cached answer. Fix: go to chrome://net-internals/#dns and clear it there.`,
    diagramKey: 'dns',
    sceneKey: 'dns',
    seoDescription: 'How DNS resolution works: the 5-level cache chain from browser to authoritative nameserver, TTLs, DoH, DNSSEC, and why Chrome has its own DNS cache.',
  },
  {
    id: 'tcp-connection',
    phase: 'Network',
    order: 3,
    title: 'TCP Connection',
    subtitle: 'A formal handshake before data flows — like establishing a phone call',
    example: `Your computer (192.168.1.5) wants to talk to GitHub (140.82.114.5):

→ You: "Hello, I'd like to connect. My starting message number is 1234567." (SYN)
← Server: "Hello back. Got your number. Mine is 9876543. Expecting yours +1 next." (SYN-ACK)
→ You: "Confirmed. Your number +1. We're connected." (ACK)

That's three messages — one full round trip — just to say hello.
At 50ms away, that's 50ms of pure waiting before any data flows.
Then TLS adds another round trip on top.

HTTP/3 (the latest version) skips this entirely by using a smarter transport underneath.`,
    facts: [
      ['Random starting numbers', 'Each connection picks a random starting sequence number — prevents old packets from a previous connection interfering.'],
      ['In-order delivery', 'HTTP/1.1 must receive responses in order. One slow response blocks all others — called head-of-line blocking. HTTP/2 and 3 fix this.'],
      ['Slow Start', 'New connections start sending data slowly and ramp up. This is why the first ~14KB loads fastest — it fits in the first burst.'],
      ['QUIC (HTTP/3)', 'Replaces TCP with a UDP-based transport. Combines the TCP handshake and TLS in one step. Saves at least one round trip.'],
      ['Connection reuse', 'Keep-Alive lets multiple requests share one TCP connection. Without it, every image would need its own handshake.'],
      ['TIME_WAIT state', 'After closing, ports wait up to 4 minutes before reuse. High-traffic servers can run out of ports if closing connections too fast.'],
    ],
    insight: `Slow Start is why pages under 14KB feel dramatically faster: that's the amount of data TCP sends in its very first burst. Server-side rendering your entire page HTML under 14KB means the whole document arrives in one shot. Above that, you're waiting for more rounds.`,
    diagramKey: 'tcp',
    sceneKey: 'tcp',
    seoDescription: 'How TCP 3-way handshake works: SYN/SYN-ACK/ACK sequence, slow start, congestion control, and why HTTP/3 QUIC eliminates this round trip.',
  },
  {
    id: 'tls-handshake',
    phase: 'Network',
    order: 4,
    title: 'TLS Handshake',
    subtitle: 'How two strangers agree on a secret code without ever saying it out loud',
    example: `After TCP connects, you and GitHub's server need to set up encryption:

→ You: "Here's what I support: TLS 1.3, these cipher options. And a random number."
← Server: "Here's my certificate — proof I'm really GitHub, signed by a trusted authority. Here's my public key."
→ You: Check the certificate chain back to an authority your browser already trusts...
    Both sides: use math (Diffie-Hellman key exchange) to independently calculate the same secret key — without ever sending the key itself.
← Server: "Ready. Switching to encrypted mode."

Every request from here is encrypted. Nobody watching the network can read it.

TLS 1.3 does this in 1 round trip. Older TLS 1.2 needed 2.`,
    facts: [
      ['Certificate chain', 'Your browser ships with ~150 trusted root authorities. GitHub\'s cert is signed by one — that\'s how you know it\'s real.'],
      ['The key exchange trick', 'Diffie-Hellman lets both sides independently compute the same secret from public information. Mathematical magic.'],
      ['TLS 1.3 vs 1.2', 'TLS 1.3 cuts the handshake from 2 round trips to 1 by sending more information upfront. Saves 50–100ms.'],
      ['0-RTT resumption', 'Returning visitors can send their first request alongside the TLS handshake — zero extra round trips. Slight replay risk.'],
      ['Certificate Transparency', 'Every certificate is logged in public ledgers. Lets anyone audit whether a CA is issuing fake certs.'],
      ['SNI (Server Name)', 'Lets one server hold many certificates. The domain name is sent unencrypted in the handshake so the server picks the right cert.'],
    ],
    insight: `The server name (SNI) is sent in plaintext during the TLS handshake — which means your ISP or network can see which sites you visit, even on HTTPS. You can't read the content of the request, but the domain is visible. This is why Encrypted Client Hello (ECH) exists — it encrypts the SNI too.`,
    diagramKey: 'tls',
    sceneKey: 'tls',
    seoDescription: 'How TLS handshake works: certificate chain, Diffie-Hellman key exchange, TLS 1.3 improvements, and why HTTPS still leaks the domain name.',
  },
  {
    id: 'http-request',
    phase: 'Network',
    order: 5,
    title: 'HTTP Request',
    subtitle: 'A structured conversation between your browser and the server',
    example: `Your browser sends a text message to GitHub — here's what it looks like:

GET /users/torvalds HTTP/2
Host: api.github.com
Accept: application/json
Authorization: Bearer ghp_xxxx
User-Agent: Mozilla/5.0 (Chrome/124)
Accept-Encoding: gzip, br

↑ That's it. Plain text (then encrypted by TLS). "GET" means "give me this".
The server responds:

HTTP/2 200 OK
Content-Type: application/json
Content-Encoding: br (compressed)
Cache-Control: max-age=60
X-RateLimit-Remaining: 58

{ "login": "torvalds", "public_repos": 8 ... }

HTTP/2 sends multiple of these conversations at once over the same connection — in parallel.`,
    facts: [
      ['HTTP verbs', 'GET=fetch, POST=send new data, PUT=replace, PATCH=update part of it, DELETE=remove. The verb tells the server the intent.'],
      ['Status codes', '2xx=success, 3xx=redirect, 4xx=your mistake (404=not found), 5xx=server\'s mistake. 418 I\'m a Teapot is a real code.'],
      ['HTTP/2 multiplexing', 'Multiple requests in parallel over one connection. Kills the "6 connections per domain" limit of HTTP/1.1.'],
      ['HTTP/3 over QUIC', 'Same HTTP semantics, but over UDP instead of TCP. No more TCP head-of-line blocking. Faster on lossy networks.'],
      ['Compression', 'Brotli (br) compresses text ~20% better than gzip. Enabled by Accept-Encoding. Most APIs and pages use it.'],
      ['CORS preflight', 'Cross-origin POST/PUT/PATCH sends an OPTIONS request first to ask permission. Adds a round trip.'],
    ],
    insight: `The HTTP method is just text — nothing enforces that a GET doesn't modify data server-side. By convention GET should be safe and idempotent. But plenty of APIs use GET with side effects. This is why browser prefetch can cause unexpected mutations if the server doesn't follow the convention.`,
    diagramKey: 'http',
    sceneKey: 'http',
    seoDescription: 'How HTTP requests and responses work: headers, status codes, HTTP/2 multiplexing, compression, and CORS preflight requests.',
  },
  {
    id: 'html-parsing',
    phase: 'Browser',
    order: 6,
    title: 'HTML Parsing',
    subtitle: 'Converting raw text into a living tree the browser can work with',
    example: `The server sends plain text. The browser turns it into a tree of objects:

<html>              → creates the root node
  <head>            → child of html
    <script src=""> → STOPS PARSING. Downloads the script. Runs it. Then continues.
  </head>
  <body>            → child of html
    <div id="app">  → child of body
      <p>Hello</p>  → child of div

Result: a Document Object Model (DOM) tree.
JavaScript can walk this tree and change it at any time.

The parser is deliberately error-tolerant — it will try to make sense of broken HTML rather than show an error.`,
    facts: [
      ['Render-blocking scripts', 'A <script> without async or defer stops HTML parsing completely until it downloads and runs.'],
      ['Error recovery', 'The HTML parser never throws errors. It silently fixes missing closing tags, misplaced elements, and typos.'],
      ['async vs defer', 'async: download in parallel, run immediately when ready (may be out of order). defer: run after parsing, in order.'],
      ['Preload scanner', 'While a script blocks parsing, a separate background scanner keeps looking ahead for images/fonts to start downloading.'],
      ['innerHTML gotcha', 'Setting innerHTML re-parses HTML from scratch. Every child node gets destroyed and recreated — even if unchanged.'],
      ['Comment nodes', 'Comments are real nodes in the DOM tree, accessible via JavaScript. Some frameworks use them as markers.'],
    ],
    insight: `The preload scanner is why <link rel="preload"> works so well: it runs in parallel with the main parser and script execution. Even if a render-blocking script stops parsing for 500ms, the preload scanner has already started fetching your hero image. Remove the preload hint and that 500ms stall costs you image load time too.`,
    diagramKey: 'html',
    sceneKey: 'html',
    seoDescription: 'How HTML parsing works: the DOM tree, render-blocking scripts, async vs defer, preload scanner, and error recovery.',
  },
  {
    id: 'css-parsing',
    phase: 'Browser',
    order: 7,
    title: 'CSS Parsing',
    subtitle: 'Building the style rulebook before a single pixel gets painted',
    example: `The browser processes your CSS into two structures:

1. CSSOM (CSS Object Model) — a tree matching the DOM:
   body { font-size: 16px }  →  root style rule
   .card { padding: 16px }   →  applies to .card nodes
   .card p { color: red }    →  applies to p inside .card

2. Cascade resolution — for each element, figure out which rules win:
   - Specificity: #id > .class > element
   - !important overrides everything (use sparingly)
   - Later rules beat earlier ones if equal specificity

Until the CSSOM is complete, the browser pauses rendering.
(One slow CSS file = white screen while it downloads.)`,
    facts: [
      ['Render-blocking CSS', '<link rel="stylesheet"> blocks rendering until fully downloaded and parsed. Unlike JS, there\'s no async CSS.'],
      ['Specificity scoring', 'IDs score 100, classes 10, elements 1. The highest score wins. !important beats everything.'],
      ['Critical CSS inlining', 'Putting above-the-fold styles in a <style> tag in <head> lets the first paint happen before external CSS loads.'],
      ['CSS containment', 'contain: layout tells the browser style changes here don\'t affect the rest of the page. Speeds up recalculation.'],
      ['Unused CSS cost', 'Browser parses ALL CSS rules even if they match nothing. Large unused CSS files slow down every page — not just pages that use them.'],
      ['Custom properties (variables)', 'CSS variables are resolved at paint time, not parse time — they can be changed by JavaScript without re-parsing CSS.'],
    ],
    insight: `CSS is render-blocking but has no async equivalent. The trick is Critical CSS: extract just the styles needed for above-the-fold content and inline them in a <style> tag. The rest loads non-blocking via a media trick: <link rel="stylesheet" media="print" onload="this.media='all'">. Ugly but effective.`,
    diagramKey: 'css',
    sceneKey: 'css',
    seoDescription: 'How CSS parsing works: CSSOM construction, cascade specificity, render-blocking behavior, and critical CSS optimization.',
  },
  {
    id: 'render-tree',
    phase: 'Render',
    order: 8,
    title: 'Render Tree',
    subtitle: 'Merging HTML structure and CSS styles into one thing the browser can draw',
    example: `DOM + CSSOM → Render Tree (only what's visible):

DOM node             CSSOM rule           Render tree?
<html>               display: block       ✓ included
<head>               (no visual style)    ✗ skipped
<script>             (no visual style)    ✗ skipped
<body>               display: block       ✓ included
<div class="card">   display: flex        ✓ included
<p style="display:none"> display: none    ✗ excluded (not visible)
<span>               visibility: hidden   ✓ included (takes up space, just invisible)

The render tree only contains elements that affect the visual layout.
display:none = gone from render tree.
visibility:hidden = still in render tree (takes up space).`,
    facts: [
      ['display:none vs visibility:hidden', 'display:none removes the element from layout entirely. visibility:hidden keeps the space but hides the content.'],
      ['Pseudo-elements', '::before and ::after from CSS exist in the render tree even though they\'re not in the DOM.'],
      ['Shadow DOM', 'Web components can have their own private render subtree, isolated from the main document styles.'],
      ['CSS counters', 'Implemented in the render tree — counter() increments as the renderer walks the tree.'],
      ['Render tree invalidation', 'Changing a class triggers CSSOM re-calculation, render tree rebuild, then layout. Batch DOM changes to avoid this.'],
      ['Flat tree', 'Shadow DOM and slots get "flattened" into a single tree for rendering — separate from the logical DOM structure.'],
    ],
    insight: `display:none is more expensive to toggle than visibility:hidden. Toggling display:none causes layout for the entire surrounding context — the tree has to be rebuilt around the gap. visibility:hidden just skips the paint step. If you're hiding/showing things frequently (tabs, dropdowns), consider opacity:0 + pointer-events:none instead — no layout, no paint, GPU-only.`,
    diagramKey: 'rt',
    sceneKey: 'renderTree',
    seoDescription: 'How the render tree is built by combining DOM and CSSOM: what gets included, what gets excluded, and the difference between display none and visibility hidden.',
  },
  {
    id: 'layout',
    phase: 'Render',
    order: 9,
    title: 'Layout',
    subtitle: 'Calculating exactly where every element sits and how big it is',
    example: `The browser walks the render tree and calculates geometry:

<div class="container">   → x:0, y:0, width:1280, height:?
  <div class="sidebar">   → x:0, y:0, width:256, height:800
  <div class="main">      → x:256, y:0, width:1024, height:?
    <p>Hello world</p>    → x:256, y:16, width:1024, height:24

This is expensive. Any of these trigger a full re-layout:
• Adding/removing DOM elements
• Changing width, height, padding, margin, font-size
• Reading offsetWidth or getBoundingClientRect() after a DOM change (forced layout)

One accidental layout inside a loop = "layout thrashing" = jank.`,
    facts: [
      ['Flow vs positioned', 'Block elements stack vertically by default. position:absolute/fixed removes them from normal flow.'],
      ['Flexbox and Grid', 'Both are more efficient than float-based layouts because the browser can calculate them in fewer passes.'],
      ['Layout thrashing', 'Reading a layout property (offsetWidth) after writing to the DOM forces the browser to recalculate immediately. Do all writes first, then all reads.'],
      ['Intrinsic sizing', 'min-content, max-content, and fit-content let content determine its own size — useful for responsive components.'],
      ['Contain: layout', 'Tells the browser changes inside this element don\'t affect outside layout. Massive performance win for isolated components.'],
      ['Subgrid', 'CSS Subgrid lets children align to a parent grid — previously required JavaScript to achieve.'],
    ],
    insight: `The classic layout thrashing pattern: you write a style (el.style.width = '100px'), then read a layout value (el.offsetWidth) in a loop. Each read forces the browser to flush pending layout calculations first. Result: hundreds of layouts per frame instead of one. FastDOM and modern frameworks batch these to avoid it.`,
    diagramKey: 'layout',
    sceneKey: 'layout',
    seoDescription: 'How browser layout works: the box model, flow vs positioned elements, flexbox/grid efficiency, and layout thrashing.',
  },
  {
    id: 'paint',
    phase: 'Render',
    order: 10,
    title: 'Paint',
    subtitle: 'Turning geometry into actual pixels — color, shadows, text, borders',
    example: `Layout calculated positions. Paint fills them in:

For each render layer, the browser records drawing commands:
• "Draw rect at (0,0) size (1280×800) fill #08080F"
• "Draw text 'Hello' at (256,16) font 16px Geist color #FFFFFF"
• "Draw box-shadow: 0 4px 16px rgba(0,0,0,0.5)"
• "Draw border-radius: clip rect to rounded shape"

These commands go into a "display list" — not yet actual pixels.
The actual pixel-filling (rasterization) can happen on CPU or be handed off to the GPU.

What triggers a repaint:
• Changing color, background, box-shadow, visibility
• NOT changing transform or opacity (those skip paint entirely!)`,
    facts: [
      ['Display list', 'Paint produces a list of drawing commands, not pixels directly. This list can be replayed for partial updates.'],
      ['Rasterization', 'Converting those commands into actual pixels. Can happen on the CPU or be tiled and sent to the GPU.'],
      ['Paint flashing', 'Chrome DevTools can highlight which parts of the page are repainting — look for the green overlay in Rendering panel.'],
      ['will-change hint', 'will-change: transform tells the browser "this will animate" — moves it to its own layer proactively.'],
      ['Text rendering', 'Text is the most complex paint operation: font hinting, sub-pixel rendering, emoji fallbacks, right-to-left support.'],
      ['SVG vs Canvas', 'SVG is painted by the browser\'s paint engine (scalable, accessible). Canvas is a raw pixel buffer you control via JavaScript.'],
    ],
    insight: `opacity and transform are the only two CSS properties that skip paint entirely and go straight to the compositor. Every other animatable property (color, width, background, even border-radius) triggers paint on every frame. This is why "animate only transform and opacity" is the golden rule of smooth animation.`,
    diagramKey: 'paint',
    sceneKey: 'paint',
    seoDescription: 'How browser painting works: display lists, rasterization, what triggers repaints, and why transform and opacity are the smooth animation exceptions.',
  },
  {
    id: 'compositing',
    phase: 'Render',
    order: 11,
    title: 'Compositing',
    subtitle: 'The GPU assembles the final image from separate layers like Photoshop',
    example: `After paint, the browser splits the page into layers and sends them to the GPU:

Layer 0 (base): background, text, static content  → painted to texture
Layer 1 (fixed header): position:fixed nav         → separate texture
Layer 2 (modal overlay): transform/opacity anim   → separate texture
Layer 3 (video):  <video> element                 → separate texture

GPU blends them in order at 60fps:
Layer 0 → Layer 1 → Layer 2 → Layer 3 = final frame

When you do transform: translateX(100px), only Layer 2's position changes.
The GPU just repositions the texture — no repaint needed. That's why it's fast.`,
    facts: [
      ['Compositing thread', 'Runs on its own thread, separate from JavaScript. Even if JS is busy, scrolling can stay smooth.'],
      ['Layer promotion triggers', 'transform, opacity, will-change, position:fixed, <video>, <canvas>, and some filters create new layers.'],
      ['Layer explosion', 'Too many layers wastes GPU memory. A page with 200 composited layers can use hundreds of MB of GPU RAM.'],
      ['Scroll jank', 'If a scroll event listener calls preventDefault(), it blocks the compositor thread and causes scroll jank.'],
      ['Passive event listeners', '{ passive: true } on scroll/touch events tells the browser you won\'t call preventDefault() — unlocks smooth compositing.'],
      ['CSS will-change', 'Moves an element to its own layer before animation starts. Prevents the "first frame flash" of layer promotion.'],
    ],
    insight: `Passive event listeners ({ passive: true }) are one of the highest-impact one-liners in frontend performance. By promising you won't call preventDefault(), you let the compositor thread handle scroll and touch independently of JS. Chrome shows a warning in DevTools when it detects non-passive scroll listeners blocking compositing.`,
    diagramKey: 'composite',
    sceneKey: 'compositing',
    seoDescription: 'How browser compositing works: GPU layers, the compositor thread, why transform/opacity are fast, layer promotion, and passive event listeners.',
  },
  {
    id: 'v8-engine',
    phase: 'Execute',
    order: 12,
    title: 'V8 Engine',
    subtitle: 'How JavaScript goes from text to machine code — faster than you\'d expect',
    example: `function add(a, b) { return a + b }

// First call: V8 interprets it slowly via Ignition (the interpreter)
add(1, 2)   // interpreted bytecode, ~50ns

// After enough calls, TurboFan (the compiler) kicks in:
// V8 assumes: "a and b are always numbers. I'll compile a fast number-add."
add(3, 4)   // compiled machine code, ~1ns

// But if you break the assumption:
add("hello", "world")  // strings! V8 "deoptimizes" back to slow interpreter

This is why TypeScript and consistent types matter for performance.
V8 loves predictable code.`,
    facts: [
      ['Ignition (interpreter)', 'Runs JavaScript bytecode line by line. Slow but starts immediately — no compilation wait.'],
      ['TurboFan (compiler)', 'Watches which functions run often, compiles them to optimised machine code. Functions that matter get fast.'],
      ['Hidden classes', 'V8 tracks object shapes internally. Objects with the same properties in the same order share a fast hidden class.'],
      ['Inline caches', 'V8 remembers "last time this property lookup hit offset 8" and shortcuts future lookups. Type changes break this.'],
      ['Garbage collection', 'Memory is freed in short "minor GC" bursts for young objects, and longer "major GC" pauses for old ones.'],
      ['Just-in-time (JIT)', 'V8 compiles code while running it, not upfront. The warm-up cost is why long-running Node processes get faster over time.'],
    ],
    insight: `Adding properties to objects in inconsistent orders creates different "hidden classes" in V8, forcing it to use slow generic property lookups. Always initialize object properties in the same order, and avoid adding properties after creation. This is the main reason {} literals are often faster than Object.assign() in hot paths.`,
    diagramKey: 'v8',
    sceneKey: 'v8',
    seoDescription: 'How V8 JavaScript engine works: Ignition interpreter, TurboFan JIT compiler, hidden classes, inline caches, and deoptimization.',
  },
  {
    id: 'event-loop',
    phase: 'Execute',
    order: 13,
    title: 'Event Loop',
    subtitle: 'How JavaScript does one thing at a time — but still feels concurrent',
    example: `JavaScript is single-threaded: one thing at a time.
The event loop is how it handles waiting without blocking:

console.log("1")                     // runs now
setTimeout(() => console.log("3"))   // schedules for "later" (macro task)
Promise.resolve().then(() => console.log("2"))  // micro task (runs first!)
console.log("4")                     // runs now

Output: 1 → 4 → 2 → 3

The rule:
• Run all synchronous code first
• Then drain ALL microtasks (Promises, queueMicrotask)
• Then render the frame (if needed)
• Then run ONE macro task (setTimeout, setInterval, I/O)
• Repeat`,
    facts: [
      ['Call stack', 'Where synchronous code runs. One function at a time, last in first out. If it\'s never empty, the page freezes.'],
      ['Microtask queue', 'Promise .then() callbacks go here. The entire queue drains between every macro task — before any rendering.'],
      ['Macro task queue', 'setTimeout, setInterval, I/O, user events. One per loop iteration. Rendering happens between macro tasks.'],
      ['requestAnimationFrame', 'Runs just before the browser paints. Ideal for visual updates — guaranteed to run at 60fps cadence.'],
      ['Long tasks', 'Anything taking more than 50ms on the main thread blocks rendering. Break with setTimeout(0) or Web Workers.'],
      ['Web Workers', 'True parallel threads for JavaScript — but no DOM access. Great for heavy computation without blocking the UI.'],
    ],
    insight: `Microtasks (Promises) drain completely before the browser gets to render. A loop that resolves millions of promises will hold the browser hostage even though each individual .then() looks harmless. If you need to do async work without blocking rendering, use setTimeout(fn, 0) to yield to the browser between chunks — it splits work into separate macro tasks.`,
    diagramKey: 'evloop',
    sceneKey: 'eventLoop',
    seoDescription: 'How the JavaScript event loop works: call stack, microtask queue, macro tasks, requestAnimationFrame, and why long tasks block rendering.',
  },
  {
    id: 'http-caching',
    phase: 'Optimize',
    order: 14,
    title: 'HTTP Caching',
    subtitle: 'The fastest request is the one that never had to leave your device',
    example: `Browser asks: "Do I already have this? Is it still fresh?"

First visit to github.com/avatar.png:
→ GET /avatar.png
← 200 OK + Cache-Control: max-age=31536000 (cache for 1 year)
  Browser saves it with an expiry date.

Second visit (within a year):
→ Browser: "I have it, not expired." Serves from memory. No network request at all.

After a year, or with a changed URL:
→ GET /avatar.png (or /avatar-v2.png)
← 200 OK + new response. Cache updated.

This is "cache busting" — change the filename to force a fresh download.`,
    facts: [
      ['Cache-Control: max-age', 'Tells the browser how many seconds to trust the cached copy. max-age=0 means always check.'],
      ['ETag (fingerprint)', 'Server sends a fingerprint of the content. Browser sends it back next time: "Is this still current?" 304 Not Modified saves bandwidth.'],
      ['Immutable flag', 'Cache-Control: immutable tells the browser: "This URL\'s content never changes. Don\'t even check." For hashed assets.'],
      ['Service Worker cache', 'JavaScript-controlled cache. Can serve content offline. Lives in a separate storage from the HTTP cache.'],
      ['Vary header', 'Tells caches that responses vary by header (e.g. Accept-Language). Multiple cached versions for the same URL.'],
      ['Stale-while-revalidate', 'Serve the cached copy immediately, then fetch a fresh copy in the background for next time. Fast + eventually fresh.'],
    ],
    insight: `The Cache-Control: immutable flag is massively underused. If you're serving assets with content-hashed filenames (app.a1b2c3.js), they can never have the same content at the same URL. Adding immutable tells every browser and CDN to never even check for updates — shaving off a conditional request per asset per load.`,
    diagramKey: 'cache',
    sceneKey: 'cache',
    seoDescription: 'How HTTP caching works: Cache-Control max-age, ETags, immutable flag, cache busting, and stale-while-revalidate.',
    codeDemo: {
      label: 'Caching Strategy',
      bad: `// Every deploy: browser has to re-download everything
// because the filename never changes
<script src="/app.js"></script>
<link rel="stylesheet" href="/styles.css" />

// Response header:
Cache-Control: no-cache`,
      good: `// Hashed filenames: only re-download when content changes
// Browser caches forever — the URL itself is the version
<script src="/app.a1b2c3d4.js"></script>
<link rel="stylesheet" href="/styles.9f8e7d6c.css" />

// Response header:
Cache-Control: max-age=31536000, immutable`,
    },
  },
  {
    id: 'cdn-edge',
    phase: 'Optimize',
    order: 15,
    title: 'CDN & Edge',
    subtitle: 'Putting your content closer to the people who need it',
    example: `Without a CDN, all requests go to one server:
User in Tokyo → 200ms → server in Virginia → 200ms back = 400ms round trip

With a CDN, content is cached at hundreds of locations:
User in Tokyo → 5ms → CDN edge in Tokyo → 5ms back = 10ms round trip

How it works:
1. Your server ("origin") serves the first request from Tokyo.
2. The CDN edge in Tokyo caches the response.
3. All future Tokyo users get the cached copy — your server never sees them.

For static files (images, JS, CSS) this is an enormous win.
For dynamic content, modern CDNs run JavaScript at the edge too.`,
    facts: [
      ['Points of Presence (PoPs)', 'CDN edge locations worldwide. Major CDNs have 200–300+ PoPs. More PoPs = fewer users far from an edge.'],
      ['Cache hit ratio', 'What % of requests are served from cache vs your origin. 90%+ is good. Low ratio = origin paying the full cost.'],
      ['Edge Functions', 'Run JavaScript at CDN edge locations. Same latency win as static files, but for dynamic server logic.'],
      ['Anycast routing', 'CDNs use anycast DNS so "cdn.example.com" resolves to the nearest edge server automatically.'],
      ['Origin shield', 'Extra caching layer between the CDN edges and your origin server. Reduces origin load during cache misses.'],
      ['Purging', 'Clearing cached content from all CDN edges. Some CDNs propagate globally in seconds, others take minutes.'],
    ],
    insight: `CDN cache hit ratio is the metric that matters most. A CDN at 60% hit ratio still sends 40% of traffic to your origin — defeating much of the purpose. High hit ratios require long max-age on content and careful cache key design. Personalized responses (with cookies) often bypass CDN caches entirely unless you strip the cookie header.`,
    diagramKey: 'cdn',
    sceneKey: 'cdn',
    seoDescription: 'How CDNs and edge networks work: points of presence, cache hit ratios, edge functions, and origin shields.',
  },
  {
    id: 'service-workers',
    phase: 'Optimize',
    order: 16,
    title: 'Service Workers',
    subtitle: 'A programmable middleman that lives between your app and the network',
    example: `A Service Worker is JavaScript that runs in the background, separate from your page:

1. Registration: your page installs it once
   navigator.serviceWorker.register('/sw.js')

2. Activation: it controls all future page loads
   self.addEventListener('install', e => e.waitUntil(cache.open('v1').then(c => c.addAll(['/','app.js']))))

3. Every network request goes through it:
   self.addEventListener('fetch', e => {
     e.respondWith(
       caches.match(e.request) || fetch(e.request)
     )
   })

Load the page with no internet: it serves from cache.
Update available: background sync downloads new version, activates on next visit.`,
    facts: [
      ['Lifecycle', 'installing → waiting → activating → activated. A new SW waits until all tabs using the old one are closed.'],
      ['Cache Storage API', 'Separate from the HTTP cache. Your JavaScript controls it directly — nothing expires automatically.'],
      ['Background Sync', 'Queue writes while offline. The SW sends them when connectivity returns — even if the tab was closed.'],
      ['Push notifications', 'Server can wake the SW and show a notification even when the site isn\'t open.'],
      ['HTTPS only', 'Service workers require HTTPS (or localhost). They can intercept all requests — too powerful for HTTP.'],
      ['Scope restriction', '/sw.js at the root controls everything. /blog/sw.js only controls /blog/* paths.'],
    ],
    insight: `Service workers introduce a classic cache invalidation problem: a new SW waits in "waiting" state until the old version's tabs all close. If users never fully close their tabs (common), they could be stuck on the old version for days. The fix: call skipWaiting() in install and clients.claim() in activate — but only if you're confident the new version is backward-compatible with old cached content.`,
    diagramKey: 'sw',
    sceneKey: 'sw',
    seoDescription: 'How service workers work: lifecycle, Cache Storage API, offline support, background sync, and push notifications.',
    codeDemo: {
      label: 'Offline Strategy',
      bad: `// No service worker — no offline support
// Every request hits the network. No internet = broken app.
fetch('/api/data')
  .then(r => r.json())
  .then(data => render(data))`,
      good: `// Cache-first with network fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached ?? fetch(event.request).then(response => {
        const clone = response.clone()
        caches.open('v1').then(cache => cache.put(event.request, clone))
        return response
      })
    })
  )
})`,
    },
  },
]

export function getTopicBySlug(slug: string): Topic | undefined {
  return topics.find(t => t.id === slug)
}

export function getTopicsByPhase(phase: Phase): Topic[] {
  return topics.filter(t => t.phase === phase).sort((a, b) => a.order - b.order)
}

export function getAdjacentTopics(slug: string): { prev: Topic | null; next: Topic | null } {
  const idx = topics.findIndex(t => t.id === slug)
  return {
    prev: idx > 0 ? topics[idx - 1] : null,
    next: idx < topics.length - 1 ? topics[idx + 1] : null,
  }
}
