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
  outputs?: { label: string; type: string }
  pitfalls?: string[]
  step?: number
  globalOrder?: number
  arrow?: string
  hook?: string
  newConcept?: boolean
  source?: "original" | "hbr" | "wf"
}

export const PHASES = ['Network', 'Browser', 'Render', 'Optimize'] as const
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

• https — the protocol (how to talk). Browsers have a built-in list of 180,000+ sites (2024) that must always use HTTPS, even if you typed http://. GitHub is on that list.
• api.github.com — the address. This is what gets looked up in DNS next.
• /users/torvalds?tab=repos — the path and query, sent as-is to GitHub's server.
• #about — this part never leaves your browser. The server never sees it. It just tells the browser to scroll to a section called "about".

The split happens in milliseconds, entirely in memory. No network yet.`,
    facts: [
      ['The #fragment rule', 'The part after # is stripped before any request. Servers never see it — that\'s why single-page apps can use #/routes without a server-side routing change.'],
      ['HSTS preload list', '180,000+ domains in Chrome\'s hardcoded list (2024). Upgrading http→https happens before DNS, no network needed.'],
      ['Punycode encoding', 'Non-ASCII domains like münchen.de get encoded to xn--mnchen-3ya.de so old DNS servers can handle them.'],
      ['Default ports', 'http:// implies port 80, https:// implies 443. Browsers omit them from the request unless you specify a different one.'],
      ['URL state machine', 'The WHATWG URL parser has 80+ states — intentionally lenient to match real-world messy URLs browsers encounter in the wild.'],
      ['javascript: scheme', 'Technically a valid URL. Browsers parse it fine — but then explicitly block execution from the address bar as a security measure.'],
    ],
    insight: `The #fragment trick is why single-page apps work without server changes: navigate to /dashboard#settings and the server only sees /dashboard. The client reads window.location.hash and renders the settings panel. Zero server round-trips for in-page navigation. This is also why you should never put sensitive tokens in URL fragments — they appear in browser history and referrer headers sent to third-party scripts.`,
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

1. Browser cache: "Have I looked this up recently?" — No.
2. OS cache: also nothing.
3. Recursive resolver (your ISP's, or 8.8.8.8): "I don't know either, let me find out."
4. Root nameserver: "Who handles .com names?"
5. .com TLD registry: "GitHub manages their own names. Ask ns1.github.com."
6. GitHub's authoritative nameserver: "That's 140.82.114.5. Cache it for 60 seconds."

The answer flows back and gets cached at every step — so next time it's instant.
Cold first lookup: ~80ms. From cache: under 1ms.`,
    facts: [
      ['Four-level cache chain', 'Browser → OS → recursive resolver → authoritative nameserver. Each level caches the answer independently. Chrome\'s cache is completely separate from the OS — flushing system DNS does nothing to Chrome.'],
      ['TTL (Time to Live)', 'Each DNS answer carries an expiry. Low TTL = always fresh but slow failover. High TTL = fast but DNS changes take time to propagate across the internet.'],
      ['Negative caching', 'Even "this domain doesn\'t exist" gets cached. Fixing a typo in a domain name can take hours to propagate everywhere.'],
      ['DNS over HTTPS (DoH)', 'RFC 8484: DNS queries sent over HTTPS instead of plaintext UDP. Without it, your ISP can see every domain you look up — even on HTTPS sites.'],
      ['DNSSEC', 'Adds cryptographic signatures to DNS answers — proves the response wasn\'t tampered with in transit. Doesn\'t encrypt, just authenticates.'],
      ['Root nameservers', '13 named servers (A through M), but ~1,600 physical machines worldwide serving the same 13 addresses via anycast routing.'],
    ],
    insight: `Chrome keeps its own DNS cache, completely separate from your OS. This trips up nearly every developer the first time they test a DNS change: they flush the system cache, reload Chrome, and nothing changes — because Chrome is still serving its own cached answer. Fix: go to chrome://net-internals/#dns and clear it there. At 60-second TTLs, Chrome will also hold stale records for a full minute after an OS flush.`,
    diagramKey: 'dns',
    sceneKey: 'dns',
    seoDescription: 'How DNS resolution works: the 4-level cache chain from browser to authoritative nameserver, TTLs, DoH, DNSSEC, and why Chrome has its own DNS cache.',
  },
  {
    id: 'tcp-connection',
    phase: 'Network',
    order: 3,
    title: 'TCP Connection',
    subtitle: 'A formal handshake before data flows — like establishing a phone call',
    example: `Your computer (192.168.1.5) wants to talk to GitHub (140.82.114.5):

→ You: "Hello, I'd like to connect. My starting sequence number is 1234567." (SYN)
← Server: "Hello back. Got your number. Mine is 9876543. Expecting yours +1 next." (SYN-ACK)
→ You: "Confirmed. Your number +1. We're connected." (ACK)

That's three messages — one full round trip — just to say hello.
At 50ms network latency, that's 50ms of pure waiting before any data flows.
Then TLS adds another round trip on top.

HTTP/3 (the latest version) eliminates this entirely by using QUIC underneath.`,
    facts: [
      ['Three-way handshake', 'SYN → SYN-ACK → ACK. The minimum cost of establishing any TCP connection is one full round trip — paid before a single byte of application data is sent.'],
      ['Random sequence numbers', 'Each connection picks a random starting sequence number — prevents old packets from a dead connection interfering with a new one on the same port pair.'],
      ['Head-of-line blocking', 'HTTP/1.1 must receive responses in order. One slow response blocks all others sharing the same connection. HTTP/2 multiplexing solves this; HTTP/3 solves it at the transport layer.'],
      ['Slow Start', 'New connections begin transmitting conservatively and ramp up. The first ~14KB arrives in one burst. Above that, you wait for acknowledgements before sending more.'],
      ['QUIC (HTTP/3)', 'Combines the TCP handshake and TLS in a single step over UDP. Saves at least one full round trip. No head-of-line blocking at the transport layer.'],
      ['TIME_WAIT state', 'After closing, ports wait up to 4 minutes before reuse to absorb straggling packets. High-traffic servers can exhaust ephemeral ports if closing connections too fast.'],
    ],
    insight: `Slow Start is why server-rendering your entire HTML page under 14KB feels dramatically faster: that's exactly what TCP delivers in its very first burst without waiting for acknowledgement. Pages above 14KB need additional round trips before the browser has the full document. This is why critical HTML — the minimum to render the above-the-fold view — should be as small as possible, even if your total page weight doesn't matter.`,
    diagramKey: 'tcp',
    sceneKey: 'tcp',
    seoDescription: 'How TCP 3-way handshake works: SYN/SYN-ACK/ACK sequence, slow start, head-of-line blocking, and why HTTP/3 QUIC eliminates this round trip.',
    pitfalls: [
      'Connection pools have limits — Chrome caps at 6 connections per origin over HTTP/1.1. HTTP/2 multiplexing collapses these onto one connection but doesn\'t solve cross-origin sharding.',
    ],
  },
  {
    id: 'tls-handshake',
    phase: 'Network',
    order: 4,
    title: 'TLS Handshake',
    subtitle: 'How two strangers agree on a secret code without ever saying it out loud',
    example: `After TCP connects, you and GitHub's server need to set up encryption:

→ You: "Here's what I support: TLS 1.3, these cipher suites. Here's a random value."
← Server: "Here's my certificate — proof I'm really GitHub, signed by a trusted authority.
            Here's my public key. I've computed the session key. Switching to encrypted mode."
→ You: Check the certificate chain all the way back to a root authority your browser trusts.
        Use Diffie-Hellman to independently compute the same session key — without sending it.
        "Ready. Encrypted."

TLS 1.3 completes this in 1 round trip. TLS 1.2 needed 2.
Every request from here is encrypted. Nobody watching the wire can read it.`,
    facts: [
      ['Certificate chain of trust', '~140 trusted root CAs ship in Mozilla\'s CA program (Firefox baseline); Chrome and Apple ship overlapping but different sets. GitHub\'s certificate is signed by one of them — that\'s how you verify it\'s real without knowing GitHub\'s key in advance.'],
      ['Diffie-Hellman key exchange', 'Both sides independently compute the same session key from public information. The key is never transmitted — only values that let each side derive it. Mathematical magic that makes HTTPS possible.'],
      ['TLS 1.3 improvements', 'TLS 1.3 eliminated weak cipher suites, cut the handshake from 2 round trips to 1, and made forward secrecy mandatory. Old TLS 1.2 handshakes add ~100ms compared to 1.3.'],
      ['0-RTT resumption', 'Returning visitors can send application data alongside the TLS handshake — zero extra round trips. Slight replay attack risk: servers must treat 0-RTT data as potentially replayed.'],
      ['Certificate Transparency', 'Every issued certificate is logged in public, append-only ledgers. Lets anyone audit whether a Certificate Authority is issuing fraudulent certificates for domains they don\'t control.'],
      ['SNI leaks the domain', 'The Server Name Indication field — sent unencrypted so the server knows which certificate to present — reveals the domain you\'re visiting to anyone watching the network. Encrypted Client Hello (ECH) fixes this.'],
    ],
    insight: `The server name (SNI) is sent in plaintext during every TLS handshake — which means your ISP, network administrator, or anyone on your network can see every domain you visit, even over HTTPS. You can't read the content, but the destination is visible. This is why privacy-focused browsers push for Encrypted Client Hello (ECH), which wraps SNI inside an outer encrypted layer. HTTPS hides what you read; ECH hides where you go.`,
    diagramKey: 'tls',
    sceneKey: 'tls',
    seoDescription: 'How TLS handshake works: certificate chain, Diffie-Hellman key exchange, TLS 1.3 improvements, 0-RTT resumption, and why HTTPS still leaks the domain name.',
    pitfalls: [
      'TLS 1.2 is two round trips; TLS 1.3 is one. Force TLS 1.3 on your origin if you have any control over the server.',
    ],
  },
  {
    id: 'http-request',
    phase: 'Network',
    order: 5,
    title: 'HTTP Request',
    subtitle: 'A structured conversation between your browser and the server',
    example: `Your browser sends a structured message to GitHub:

GET /users/torvalds HTTP/2
Host: api.github.com
Accept: application/json
Authorization: Bearer ghp_xxxx
User-Agent: Mozilla/5.0 (Chrome/124)
Accept-Encoding: gzip, br

↑ Plain text (then encrypted by TLS). "GET" means "give me this resource."
The server responds:

HTTP/2 200 OK
Content-Type: application/json
Content-Encoding: br
Cache-Control: max-age=60
X-RateLimit-Remaining: 58

{ "login": "torvalds", "public_repos": 8 ... }

HTTP/2 sends many of these conversations in parallel over one connection.`,
    facts: [
      ['HTTP methods', 'GET=fetch (safe, idempotent), POST=create, PUT=replace, PATCH=update, DELETE=remove. These are conventions — nothing prevents a server from mutating data on GET. This is why browser prefetch can cause unintended side effects.'],
      ['Status codes', '2xx=success, 3xx=redirect, 4xx=client error (404=not found, 401=unauthorized, 429=rate limited), 5xx=server error. 418 I\'m a Teapot is real — an April Fools\' RFC that stuck.'],
      ['HTTP/2 multiplexing', 'Multiple requests in parallel over one connection using streams. Kills the HTTP/1.1 limitation of 6 connections per domain. One connection, unlimited concurrent requests.'],
      ['HTTP/3 over QUIC', 'Same HTTP semantics, but transported over QUIC (UDP-based). Eliminates TCP head-of-line blocking. A lost packet only delays one stream, not all of them.'],
      ['Brotli compression', 'Brotli (br) compresses text ~15–20% better than gzip using a pre-built dictionary of common web tokens. Nearly all modern browsers and servers support it.'],
      ['CORS preflight', 'Cross-origin non-simple requests (POST with JSON, custom headers) trigger an OPTIONS preflight asking for permission. Adds one full round trip before the actual request. Cache with Access-Control-Max-Age.'],
    ],
    insight: `The HTTP method is just text — nothing enforces that GET doesn't modify server state. The "safe and idempotent" contract is purely a convention. But browsers and CDNs trust it: Chrome prefetches GET links in the background, CDNs cache GET responses, and Google's crawler follows GET links. An API that mutates data on GET will be invisibly triggered by prefetchers and crawlers. Every mutation must use POST, PUT, PATCH, or DELETE.`,
    diagramKey: 'http',
    sceneKey: 'http',
    seoDescription: 'How HTTP requests and responses work: headers, status codes, HTTP/2 multiplexing, Brotli compression, and CORS preflight requests.',
  },
  {
    id: 'html-parsing',
    phase: 'Browser',
    order: 6,
    title: 'HTML Parsing',
    subtitle: 'Converting raw text into a living tree the browser can work with',
    example: `The server sends plain text. The parser turns it into a tree of objects — the Document Object Model:

<html>              → creates the root Document node
  <head>            → child of html
    <script src=""> → STOPS PARSING. Downloads the script. Runs it. Then continues.
  </head>
  <body>            → child of html
    <div id="app">  → child of body
      <p>Hello</p>  → child of div

The DOM is not a string. Every tag becomes a Node object with a typed role — Element, Text, Comment, DocumentFragment — and four pointers: parentNode, firstChild, nextSibling, previousSibling. Attributes hang off Element nodes as a NamedNodeMap. Text between tags becomes a separate Text node.

A tree (not a flat list) is what makes ancestry queries cheap. element.closest('.card') walks parent pointers until it matches. document.querySelectorAll('.card p') walks descendants. Both run in time proportional to depth, not document size.

JavaScript can walk and mutate this tree at any time — even mid-parse. The parser is deliberately error-tolerant: broken HTML gets silently repaired into a well-formed tree.`,
    facts: [
      ['Node, not string', 'Every DOM element is a JavaScript object with parentNode, firstChild, nextSibling, previousSibling pointers, plus an attributes map and a childNodes NodeList. In V8 a typical element costs roughly 200-400 bytes of heap; pages with 10,000 nodes carry a few megabytes of DOM before any data.'],
      ['Render-blocking scripts', 'A <script> tag without async or defer halts HTML parsing completely until the script downloads and executes. One slow third-party script can delay your entire page.'],
      ['async vs defer', 'async: download in parallel with parsing, run immediately when ready (out of order). defer: download in parallel, run after parsing completes, in document order. defer is almost always the right choice.'],
      ['Preload scanner', 'While a render-blocking script stalls the main parser, a lightweight background scanner keeps reading ahead for images, fonts, and stylesheets to start downloading in parallel. This is why preload hints work so well.'],
      ['DocumentFragment', 'A lightweight off-document subtree. Append children to a fragment, then insert the fragment into the live DOM once — the browser pays for layout and style invalidation a single time instead of once per child. The fragment itself disappears on insert; only its children remain.'],
      ['Shadow DOM', 'Web components attach a private shadow tree to an element. It is a real DOM tree with its own root, but it is encapsulated: outside selectors do not cross the shadow boundary, and styles inside do not leak out. The browser flattens shadow trees into the render tree at composition time.'],
      ['Error recovery', 'The HTML parser never throws errors. It silently repairs missing closing tags, improperly nested elements, and invalid attributes — a consequence of the web\'s need to handle decades of imperfect markup.'],
      ['innerHTML re-parsing', 'Setting innerHTML discards and recreates every child node from scratch — even nodes that didn\'t change. It also destroys attached event listeners. Use insertAdjacentHTML() or DOM APIs for targeted updates.'],
      ['Speculative parsing', 'Modern browsers run a speculative parse of the full HTML document to discover external resources early, dispatching network requests before the main parser even reaches those tags.'],
    ],
    insight: `The DOM is the contract between everything that runs in the page. The HTML parser produces it; CSS matches against it; layout reads geometry off it; JavaScript mutates it; the accessibility tree mirrors it. Every other tree in the rendering pipeline — render tree, layout tree, paint property tree — is a derivative built from this one. Which is why DOM size is the lever that touches every downstream cost: a 50,000-node DOM does not just hurt querySelectorAll, it inflates style recalculation, layout, paint, and memory all at once. Keep it small and the entire pipeline gets faster for free.`,
    diagramKey: 'html',
    sceneKey: 'html',
    seoDescription: 'How HTML parsing works: the DOM tree as a data structure, node types and pointers, render-blocking scripts, async vs defer, preload scanner, DocumentFragment, Shadow DOM, and error recovery.',
    outputs: { label: 'output', type: 'DOM tree' },
  },
  {
    id: 'css-parsing',
    phase: 'Browser',
    order: 7,
    title: 'CSS Parsing',
    subtitle: 'Building the style rulebook before a single pixel gets painted',
    example: `The browser processes all CSS into one structure — the CSS Object Model:

1. Parse: turn raw CSS text into a tree of rule objects
   document.styleSheets[0]          → CSSStyleSheet
   .cssRules                        → CSSRuleList
   .cssRules[0]                     → CSSStyleRule { selectorText, style }
   .cssRules[1]                     → CSSMediaRule { conditionText, cssRules }
   .cssRules[2]                     → CSSImportRule, CSSKeyframesRule, ...

2. Cascade: for every DOM element, compute which rules win
   - More specific rules beat less specific ones (#id > .class > element)
   - !important overrides specificity entirely
   - Later rules beat earlier ones at equal specificity

3. Inherit: properties like color and font-size flow down to children

The CSSOM is a real, mutable tree. document.styleSheets[0].insertRule('...') adds a rule live, no reparsing needed. rule.style.color = 'red' invalidates every element that matches. Mirrors the DOM in shape but holds rules instead of nodes.

Until the CSSOM is fully built, the browser pauses rendering entirely. (One slow CSS file = white screen while it downloads and parses.)`,
    facts: [
      ['CSSOM is queryable', 'document.styleSheets returns a StyleSheetList. Walk it: sheet.cssRules → rule.selectorText, rule.style, rule.cssText. Insert rules at runtime with sheet.insertRule(text, index). The CSSOM is the official API for inspecting and mutating styles without round-tripping through stylesheet text.'],
      ['Render-blocking CSS', '<link rel="stylesheet"> blocks the browser from rendering anything until fully downloaded and parsed. Unlike scripts, there\'s no async equivalent — inlining critical styles is the only escape.'],
      ['Style Invalidation', 'Changing a class or attribute marks affected DOM nodes as "style-dirty" — but doesn\'t recalculate immediately. The browser batches dirty nodes and recomputes during the next frame\'s style pass. Reading getComputedStyle() mid-frame forces a synchronous recalculation right now.'],
      ['getComputedStyle flushes', 'Calling getComputedStyle(el) is a synchronous boundary: the browser must apply every pending CSSOM mutation and recalculate styles before it can return a value. Inside a loop it kills performance — capture the value once, then iterate.'],
      ['Selector matching cost', 'On every style recalculation, the engine matches every CSS rule against every element. Deeply nested selectors (.nav .menu > li a span) force the engine to walk up the ancestor chain for each candidate. Bloom filters and selector hashing help, but the O(n×rules) relationship remains. Flat selectors are always faster.'],
      ['Specificity scoring', 'IDs score 0-1-0-0, classes and attributes 0-0-1-0, elements 0-0-0-1. The highest total wins. !important bypasses the entire system — overriding it requires another !important at equal or higher specificity.'],
      ['CSSOM vs computed style', 'The CSSOM holds rules (selector + declarations, unresolved). The computed-style cache holds resolved values per element (px instead of em, rgba instead of var). They are different trees: the CSSOM is one shared structure; the computed-style cache hangs off individual DOM nodes and is rebuilt on every style recalculation.'],
      ['Critical CSS inlining', 'Putting above-the-fold styles in a <style> block in <head> lets the first paint happen before external CSS finishes loading. The tradeoff: these styles aren\'t cached separately.'],
      ['CSS custom properties', 'Variables are resolved at computed-value time, not parse time. You can change --color: blue to --color: red via JavaScript at runtime without re-parsing any CSS. The cascade recalculates only the affected properties.'],
      ['Unused CSS', 'The browser parses all CSS rules even if they match nothing on the current page. A 200KB stylesheet on a page that uses 5% of its rules wastes parse time on every navigation.'],
    ],
    insight: `The CSSOM and the DOM are siblings, not parent and child. The browser builds them in parallel, then joins them at style recalculation — for every DOM node, walk the CSSOM, find matching rules, resolve specificity, write the result into the node's computed-style slot. This is also why CSS is render-blocking but JavaScript can be deferred: the renderer literally cannot compose its output without both trees in hand. Lose either one and the screen stays blank. The classic <link media="print" onload="this.media='all'"> trick exploits this by making the browser treat a sheet as non-applicable until it has loaded — only then does it join the CSSOM and unblock the first paint.`,
    diagramKey: 'css',
    sceneKey: 'css',
    seoDescription: 'How CSS parsing and the CSSOM work: CSSStyleSheet and CSSRule hierarchy, queryable styleSheets API, cascade specificity, style invalidation, getComputedStyle flushing, and critical CSS optimization.',
    outputs: { label: 'output', type: 'CSSOM' },
  },
  {
    id: 'render-tree',
    phase: 'Render',
    order: 8,
    title: 'Render Tree',
    subtitle: 'Merging structure and style into the blueprint the browser will actually draw',
    example: `DOM + CSSOM → Render Tree (filtered to only what's visible):

DOM node                  CSSOM rule             In Render Tree?
<html>                    display: block         ✓ included
<head>                    (no visual role)       ✗ skipped
<script>                  (no visual role)       ✗ skipped
<body>                    display: block         ✓ included
<div class="card">        display: flex          ✓ included
<p style="display:none">  display: none          ✗ excluded — removed from layout
<span>                    visibility: hidden     ✓ included — takes up space, just transparent
::before (from CSS)       content: '→'           ✓ included — not in DOM, but real in render tree

After the Render Tree, a Layout Tree of LayoutObjects is built from it.
The browser calculates geometry from the Layout Tree, not the DOM directly.`,
    facts: [
      ['Critical Rendering Path', 'The browser\'s master rendering loop, triggered once per frame by the VSync signal from the monitor. It runs in strict sequence: Style Recalculation → Layout → PrePaint → Paint → Commit. Every millisecond your JavaScript blocks the main thread delays this entire pipeline.'],
      ['Layout Tree', 'After the Render Tree filters non-visual nodes, a parallel Layout Tree of LayoutObject nodes is built — one per visible element, plus pseudo-elements. Each LayoutObject holds a reference to its computed style and participates in geometry calculation. Layout traverses this tree, not the DOM.'],
      ['display:none vs visibility:hidden', 'display:none removes the element from the Layout Tree entirely — the surrounding layout has to fill the gap. visibility:hidden keeps it in the tree but skips painting. Toggling display is significantly more expensive than toggling visibility.'],
      ['Pseudo-elements are real', '::before and ::after exist in the Render Tree even though they\'re not DOM nodes. They can match CSS rules, participate in layout, and be styled like any element — they\'re just created by the browser, not your HTML.'],
      ['Shadow DOM flattening', 'Web components with Shadow DOM have their own private render subtree. Before rendering, the browser "flattens" shadow trees and slot projections into a single composite tree — separate from the logical DOM you see in DevTools.'],
      ['Render Tree invalidation', 'Changing a class triggers a chain: style dirty flag → CSSOM recalculation → Render Tree rebuild → Layout Tree rebuild → geometry recalculation. Batch DOM mutations to pay this cost once per frame, not once per change.'],
    ],
    insight: `The Critical Rendering Path is the browser's most important loop — and every line of synchronous JavaScript runs in it, competing for the same frame budget. When a framework like React does a large reconciliation pass, it's not "offscreen" — it's burning time on the main thread that the CRP needs to recalculate styles, run layout, paint, and commit to the GPU. This is the root cause of "reconciliation jank" — and why concurrent rendering (React 18's default mode) matters: it yields to the CRP between chunks of reconciliation work.`,
    diagramKey: 'rt',
    sceneKey: 'renderTree',
    seoDescription: 'How the Render Tree and Layout Tree are built: Critical Rendering Path, what gets included, display none vs visibility hidden, pseudo-elements, and Shadow DOM.',
    outputs: { label: 'output', type: 'render tree' },
  },
  {
    id: 'layout',
    phase: 'Render',
    order: 9,
    title: 'Layout',
    subtitle: 'Calculating exactly where every element sits and how big it is',
    example: `The browser walks the Layout Tree and calculates geometry using a two-pass algorithm:

Pass 1 (top-down): parent constraints flow to children
  <div class="container">  → x:0, y:0, width:1280 → passes available width to children
    <div class="sidebar">  → x:0, y:0, width:256  (25% of 1280)
    <div class="main">     → x:256, y:0, width:1024 (rest of available space)

Pass 2 (bottom-up): children report their sizes back to parents
    <p>Hello world</p>     → height:24 → reports up to .main
  <div class="main">       → height: max(child heights) → reports up to container

This two-pass traversal is why layout is expensive: one change cascades down to children
and then bounces back up to resize parents and shift siblings.`,
    facts: [
      ['Two-pass traversal', 'Layout runs top-down (parent constraints to children) then bottom-up (children report sizes to parents). Changing one element\'s geometry can cascade to every descendant and ripple back up to every ancestor — the compounding cost of "reflow."'],
      ['Layout Invalidation', 'Writing a geometric property (width, margin, font-size) sets a needsLayout dirty flag but doesn\'t compute layout immediately. The browser defers. Reading offsetWidth or getBoundingClientRect() after a write breaks this contract — the browser must flush and compute synchronously to give you an accurate answer.'],
      ['Blast Radius', 'The scope of collateral layout damage from a single change. Changing width on a top-level container forces every child to recalculate geometry — large blast radius. Changing transform on a leaf element touches nothing — blast radius zero. CSS containment (contain: layout) caps the blast radius at the element boundary.'],
      ['Layout Thrashing', 'Writing then immediately reading layout properties in a loop forces a full synchronous layout on every iteration. The fix: batch all reads first (capture values), then batch all writes. Libraries like FastDOM enforce this pattern. React\'s batched state updates prevent it at the framework level.'],
      ['contain: layout', 'Tells the browser that layout changes inside this element don\'t affect external elements. The layout engine stops propagating changes at the containment boundary. Essential for isolated dynamic components like virtualised lists, infinite scroll containers, or complex widgets.'],
      ['Flexbox and Grid efficiency', 'Both models are designed for fewer layout passes than old float-based approaches. The browser can often resolve flex/grid geometry in a single pass because the constraint propagation is mathematically bounded.'],
    ],
    insight: `The classic layout thrashing pattern: you write a style (el.style.width = '100px'), then read a layout value (el.offsetWidth) in a loop. Each read forces the browser to flush pending layout calculations first. Result: hundreds of full layout passes per frame instead of one. FastDOM and modern frameworks batch these automatically. But the deadlier version is subtler: a React component that reads getBoundingClientRect() in a useEffect that also sets state — triggering layout, triggering re-render, triggering layout again in a cascade.`,
    diagramKey: 'layout',
    sceneKey: 'layout',
    seoDescription: 'How browser layout works: two-pass traversal, layout invalidation, blast radius, layout thrashing, and CSS containment.',
    outputs: { label: 'output', type: 'fragment tree (positions + sizes)' },
    pitfalls: [
      'Reading offsetWidth / clientHeight / getBoundingClientRect after a write forces a synchronous layout (forced reflow). In a loop this is layout thrashing — the engine cannot batch.',
      'Animating layout-affecting properties (width, top, margin) makes every frame land in this step. Prefer transform and opacity, which stay on the compositor.',
      'Nested flex inside flex inside flex multiplies intrinsic-sizing passes. Flat grids and explicit dimensions cut blast radius.',
    ],
    codeDemo: {
      label: 'Layout thrashing (read-after-write)',
      bad: `// Forces a synchronous layout on every iteration:
elements.forEach(el => {
  el.style.width = '100px';      // write
  const h = el.clientHeight;      // read → forces layout NOW
  el.style.height = h + 'px';     // another write
});`,
      good: `// Batch reads, then batch writes — one layout per frame:
const heights = elements.map(el => el.clientHeight);
elements.forEach((el, i) => {
  el.style.width = '100px';
  el.style.height = heights[i] + 'px';
});`,
    },
  },
  {
    id: 'paint',
    phase: 'Render',
    order: 10,
    title: 'Paint',
    subtitle: 'Turning geometry into drawing commands — color, shadows, text, borders',
    example: `Layout calculated positions. Paint records the drawing instructions:

For each element in paint order, the browser writes commands into a display list:
• "Draw rect at (0,0) size (1280×800) fill #08080F"         ← background
• "Draw text 'Hello' at (256,16) font 16px Geist, #FFFFFF"  ← text node
• "Draw box-shadow: 0 4px 16px rgba(0,0,0,0.5)"             ← shadow
• "Draw clip path: border-radius 12px on rect (256,0,800,400)" ← rounded corners

These commands are the "display list" — not pixels yet.
Rasterization (turning commands into actual pixels) happens separately,
on CPU worker threads or handed directly to the GPU.

What triggers a repaint: color, background, box-shadow, visibility changes.
What does NOT trigger repaint: transform and opacity changes (GPU-only).`,
    facts: [
      ['Stacking Context', 'A z-axis containment bubble. Elements inside compete for z-order among themselves, but the entire stacking context is treated as one atomic unit by its parent. Created by: position + non-auto z-index, opacity < 1, transform, will-change, filter, isolation: isolate. Flex and grid children with any non-auto z-index silently create one — a common cause of unexpected layering bugs.'],
      ['Composite After Paint (CAP)', 'Chrome 94+ replaced the old engine that guessed compositing boundaries before painting. With CAP, Blink paints everything into a flat display list first, then assigns layers based on actual paint results. This eliminated the infamous "null transform hack" — transform: translateZ(0) is no longer needed to hint layering. The browser figures it out.'],
      ['Display list', 'Paint produces an ordered list of drawing commands — not pixels. This list can be efficiently replayed for partial updates, streamed to the GPU, or re-executed at different scales. Rasterization converts it to pixels separately.'],
      ['Paint Invalidation', 'When only visual properties change (color, background, box-shadow) without geometry changing, the browser skips Layout entirely and only re-records the affected paint commands. Opacity and transform changes often skip Paint entirely — they only update the compositor\'s property tree.'],
      ['Rasterization', 'Executing the display list to produce actual bitmap pixels. Can run on CPU worker threads or be handed to the GPU (via Skia Graphite → Vulkan/Metal/D3D12). Large layers are tiled into chunks (typically 256×256px) and rasterized in parallel.'],
      ['text rendering complexity', 'Text is the most expensive paint operation: font hinting, sub-pixel rendering, emoji fallback chains, ligature resolution, right-to-left shaping. A page with complex typography pays this cost on every paint.'],
    ],
    insight: `opacity and transform are the only two CSS properties that bypass paint entirely and hand work to the GPU compositor. Every other animatable property — color, background, border, border-radius, box-shadow, even clip-path — triggers paint commands on every frame it changes. This is why "animate only transform and opacity" is the ironclad rule of smooth animation. A box-shadow animation at 60fps means the browser is re-executing paint commands 60 times per second. A transform animation means it's repositioning a GPU texture — orders of magnitude cheaper.`,
    diagramKey: 'paint',
    sceneKey: 'paint',
    seoDescription: 'How browser painting works: display lists, stacking contexts, Composite After Paint, rasterization, paint invalidation, and why transform/opacity are the only smooth animation properties.',
    outputs: { label: 'output', type: 'cc::DisplayItemList' },
    pitfalls: [
      'Color changes skip Layout entirely but still trigger Paint and Compositing. They\'re cheap, not free.',
      'Large blur radius (box-shadow: 0 0 80px …) cascades raster cost across many tiles. Keep effects bounded.',
    ],
  },
  {
    id: 'compositing',
    phase: 'Render',
    order: 11,
    title: 'Compositing',
    subtitle: 'The GPU assembles the final frame from independent layers — like Photoshop',
    example: `After paint, the browser splits the page into layers and hands them to the GPU:

Layer 0 (base):           background, text, static content → painted texture
Layer 1 (fixed nav):      position:fixed header            → separate texture
Layer 2 (animated modal): transform/opacity animation      → separate texture
Layer 3 (video):          <video> element                  → separate texture

GPU blends them in order at up to 120fps:
  Layer 0 → Layer 1 → Layer 2 → Layer 3 = final frame on screen

When transform: translateX(100px) changes on Layer 2:
  → Only the compositor's position value changes
  → No style recalculation, no layout, no paint, no rasterization
  → The GPU just repositions the existing texture — sub-millisecond`,
    facts: [
      ['Commit', 'The brief handoff from the main thread to the compositor thread. After paint, the main thread copies its DisplayList and PropertyTrees to the compositor — blocking momentarily. Once done, the main thread is free to run JavaScript again. The compositor now owns the frame and runs independently until the next VSync.'],
      ['Compositor Thread', 'Runs entirely independently of the JavaScript main thread. Even if your React app is locked in a 300ms reconciliation pass, the compositor thread can keep scroll and transform/opacity animations perfectly smooth — as long as you haven\'t locked it with non-passive event listeners.'],
      ['Layer Promotion', 'Moving an element\'s rendering into its own GPU texture. Explicit: you asked for it (will-change: transform). Implicit: cc forced it because the element overlaps a promoted layer and must maintain correct z-order. Implicit promotions are the source of most layer count surprises.'],
      ['Layer Squashing', 'The compositor\'s defense against implicit layer explosion. When multiple elements overlap a promoted layer and would each receive their own texture, cc merges them into a single shared backing texture. Squashing fails when elements have conflicting clips or opacities — each then gets its own layer, compounding VRAM usage.'],
      ['Layer Explosion', 'Too many promoted layers — usually from applying will-change or transform: translateZ(0) globally. Each layer consumes GPU VRAM: width × height × 4 bytes (RGBA). A page with 200 composited layers can consume hundreds of MB of VRAM, causing thermal throttling and tab crashes, especially on mobile where VRAM is shared with system RAM.'],
      ['Passive event listeners', '{ passive: true } on scroll and touch events tells the browser you won\'t call preventDefault(). The compositor thread can then scroll immediately without waiting to check. Omit it and scrolling acquires a lock on the main thread — causing scroll jank.'],
    ],
    insight: `The golden rule of web animation: keep motion on the compositor by animating only transform and opacity. Everything else — width, top, background-color, even color — drags the main thread back into Paint or Layout, and the budget shrinks. "Compositing failed" in the DevTools Animations panel means your animation fell back to the main thread — usually because it shares a frame with a non-compositable property, overlaps a non-composited element without its own stacking context, or runs on a node with conflicting clips. The fix is almost always the same: give the element its own stacking context (isolation: isolate or will-change: transform) so the compositor can handle it independently.`,
    diagramKey: 'composite',
    sceneKey: 'compositing',
    seoDescription: 'How browser compositing works: commit, GPU layers, compositor thread, layer promotion, layer squashing, layer explosion, and passive event listeners.',
    outputs: { label: 'output', type: 'compositor frame' },
    pitfalls: [
      'The golden rule: animate only properties the compositor can handle alone — transform and opacity. Anything else forces paint or layout every frame.',
      'backdrop-filter and large filter: blur(…) recreate compositing cost per frame even when other properties are compositor-friendly.',
    ],
  },
  {
    id: 'v8-engine',
    phase: 'Browser',
    order: 12,
    title: 'V8 Engine',
    subtitle: 'How JavaScript goes from text to machine code — faster than you\'d expect',
    example: `function add(a, b) { return a + b }

// First few calls: V8 interprets bytecode via Ignition (the interpreter)
add(1, 2)   // interpreted bytecode, ~50ns per call

// After enough calls: TurboFan (the optimizing compiler) kicks in
// V8 bets: "a and b are always numbers — compile a fast integer add"
add(3, 4)   // compiled machine code, ~1ns per call

// Break the type assumption:
add("hello", "world")  // strings! V8 "deoptimizes" back to the interpreter
add(1, 2)              // TurboFan has to re-learn from scratch

This is why consistent types matter. V8 rewards predictable code.`,
    facts: [
      ['Ignition interpreter', 'Compiles JavaScript to compact bytecode and executes it immediately. Slow (~50ns per simple op) but starts instantly — no upfront compilation cost. Collects type feedback to guide TurboFan.'],
      ['TurboFan JIT compiler', 'Monitors hot functions (called many times), uses Ignition\'s type feedback to make optimistic assumptions ("a is always a Smi integer"), and compiles to highly optimised machine code. Functions that matter get fast; cold paths stay as bytecode.'],
      ['Deoptimization', 'When a TurboFan assumption proves wrong (a type changes), V8 "bails out" back to Ignition and marks the function for potential re-optimization. Frequent deoptimization — from inconsistent types or polymorphic property access — keeps hot paths slow.'],
      ['Hidden classes', 'V8 tracks object "shapes" internally. Objects with the same properties added in the same order share a fast hidden class — enabling efficient property access via known byte offsets. Adding properties in different orders or after construction creates new hidden classes, breaking fast-path lookups.'],
      ['Garbage collection', 'Memory freed via a generational GC: young objects collected in short "minor GC" pauses (a few ms), long-lived objects in longer "major GC" passes (tens of ms). Major GCs can cause visible jank — minimize long-lived allocations in hot paths.'],
      ['Inline caches', 'V8 remembers the result of property lookups ("last time I read .x, it was at offset 8 in hidden class A"). If the type is consistent, future reads skip the lookup. A property accessed on objects of 3+ different shapes becomes "megamorphic" — the cache is useless.'],
    ],
    insight: `Adding properties to objects in inconsistent order creates different hidden classes in V8, forcing it to fall back to slow generic property lookups. Always initialize all properties in the constructor, in the same order, and avoid adding properties after creation. This is why class instances are generally faster than plain objects assembled with Object.assign() in hot paths — the class constructor guarantees consistent property initialization order.`,
    diagramKey: 'v8',
    sceneKey: 'v8',
    seoDescription: 'How V8 JavaScript engine works: Ignition interpreter, TurboFan JIT compiler, hidden classes, inline caches, deoptimization, and garbage collection.',
    pitfalls: [
      'Object shape stability matters. Adding properties in different orders creates new hidden classes and forces inline caches to go megamorphic — same code, slower execution.',
      'Deoptimization is one-way for the current invocation. A function that gets deopted has to be reoptimized later; that warm-up cost is real.',
    ],
  },
  {
    id: 'event-loop',
    phase: 'Browser',
    order: 13,
    title: 'Event Loop',
    subtitle: 'How JavaScript does one thing at a time — and still feels concurrent',
    example: `JavaScript is single-threaded. The event loop is how it handles waiting without freezing:

console.log("1")                              // call stack — runs immediately
setTimeout(() => console.log("3"), 0)         // macro task queue — deferred
Promise.resolve().then(() => console.log("2")) // microtask queue — runs next
console.log("4")                              // call stack — runs immediately

Output order: 1 → 4 → 2 → 3

The loop runs like this, forever:
① Run all synchronous code until the call stack is empty
② Drain the entire microtask queue (Promises, queueMicrotask, MutationObserver)
③ If a frame is due: run rAF callbacks → Style → Layout → Paint → Commit
④ Run one macro task (setTimeout, I/O callback, user event)
↩ Back to ①`,
    facts: [
      ['Call stack', 'Where synchronous code executes — last in, first out. One function at a time. If a function never returns (infinite loop, or just takes 500ms), the entire call stack is frozen and nothing else can run, including rendering.'],
      ['Microtask queue', 'Promise .then() callbacks, queueMicrotask(), and MutationObserver callbacks live here. The entire queue drains between every macro task — before any rendering. A chain of a million resolving Promises will starve the renderer.'],
      ['Macro task queue', 'setTimeout, setInterval, I/O callbacks, user input events. Only one macro task runs per loop iteration. Rendering can happen between macro tasks — which is why setTimeout(fn, 0) can yield to the browser.'],
      ['VSync and frame timing', 'The monitor fires a VSync signal at 60Hz (every 16.67ms) or 120Hz (every 8.33ms). The browser\'s frame scheduler uses this pulse to decide when to run the rendering pipeline. Rendering only happens when the call stack is empty and the frame is due.'],
      ['Frame Budget', '16.67ms total at 60Hz. JavaScript should aim to complete in ≤10ms, leaving ~6ms for the browser\'s Style Recalculation, Layout, Paint, and Commit steps. The 10ms target — not 16.67ms — is the real ceiling. The browser\'s overhead is non-negotiable.'],
      ['Jank', 'User-visible stuttering caused by missing frame deadlines. A single 50ms JavaScript task drops 2–3 frames at 60Hz. Chrome flags any main-thread block over 50ms as a Long Task — the primary Interaction to Next Paint (INP) metric signal. Break long tasks with scheduler.yield() or setTimeout(fn, 0).'],
    ],
    insight: `Microtasks drain completely before the browser gets a chance to render. A recursive chain of Promise resolutions — common in async/await chains that never yield — will hold the browser hostage as completely as a synchronous loop, even though each individual .then() looks harmless. If you're doing async work that involves many chained Promises, break it into macro tasks with setTimeout(fn, 0) periodically to let the browser slip a frame in. This is the difference between "processing in the background" and "visibly freezing the page."`,
    diagramKey: 'evloop',
    sceneKey: 'eventLoop',
    seoDescription: 'How the JavaScript event loop works: call stack, microtask and macro task queues, VSync, frame budget, jank, and why long tasks block rendering.',
    pitfalls: [
      'Microtasks (Promise.then, queueMicrotask) drain to exhaustion between every task — a microtask that schedules another microtask blocks rendering indefinitely.',
      'setTimeout(fn, 0) is not synchronous-fast — it\'s queued as a macrotask after the current rendering opportunity. Use queueMicrotask if you need it sooner.',
    ],
  },
  {
    id: 'frame-budget',
    phase: 'Optimize',
    order: 14,
    title: 'Frame & Jank',
    subtitle: 'The 16ms deadline your code must meet — or the user feels every miss',
    example: `The display fires a VSync signal every 16.67ms (at 60Hz): "I'm ready for a new frame."
The browser must finish all main-thread work before that deadline:

VSync → [rAF callbacks] → [Style] → [Layout] → [Paint] → [Commit] → GPU → screen
          your JS here     browser pipeline

A healthy frame (≤16.67ms total):
VSync ─ rAF: 4ms ─ Style: 1ms ─ Layout: 2ms ─ Paint: 1ms ─ Commit: 0.5ms ─ GPU ─ ✓

A jank frame (deadline missed):
VSync ─ rAF: 22ms (heavy computation) ────────────────────────────────── VSync
                                    ↑ deadline blown. Previous frame shown twice.
That double-frame display is what users feel as a "stutter."

At 120Hz (modern phones, ProMotion displays), the budget halves to 8.33ms.
A task comfortable at 60Hz can cause jank on a 120Hz screen.`,
    facts: [
      ['VSync (Vertical Synchronization)', 'The hardware heartbeat from the display chip — 60Hz (16.67ms), 90Hz (11.11ms), or 120Hz (8.33ms). The browser\'s frame scheduler wakes on this signal to run the Critical Rendering Path. If the browser misses the pulse, the display shows the previous frame again.'],
      ['rAF runs first in the frame', 'requestAnimationFrame callbacks execute at the start of each frame, immediately before Style Recalculation. Any visual update made in rAF feeds directly into that frame\'s style pass — the tightest possible coupling between your code and the screen.'],
      ['The 10ms JS target', 'The 16.67ms budget isn\'t fully yours. Style Recalculation, Layout, Paint, and Commit each consume main-thread time. Target JavaScript at ≤10ms — the remaining ~6ms goes to the browser\'s own pipeline. Optimising to "just under 16ms" means you\'re already over budget.'],
      ['Long Tasks (>50ms)', 'Chrome flags any main-thread block over 50ms as a Long Task. A single 50ms task at 60Hz drops approximately 2 frames. Long Tasks are the primary Interaction to Next Paint (INP) signal — the metric Google uses to measure real-world responsiveness from 2024 onward.'],
      ['Jank perception', 'A single dropped frame at 60Hz (an extra 16ms of the same image) is usually imperceptible. Two consecutive drops (33ms) starts becoming noticeable. Any block over 100ms crosses into "feels broken." Animation jank is noticed faster than navigation delays — the eye is tuned for motion discontinuities.'],
      ['scheduler.yield()', 'The new Task Scheduler API lets you yield back to the browser mid-computation: await scheduler.yield(). The browser can slip in a frame, handle a user event, then resume where you left off. Cleaner than chaining setTimeout(fn, 0) across a long algorithm.'],
    ],
    insight: `The fix for jank is almost never "make this function faster." It's "make this function yield." A 200ms computation that yields every 8ms gives the browser 25 opportunities to render, scroll, and respond to user input across its duration. The user sees smooth rendering throughout. The same 200ms computation without yields produces a frozen page for 200ms — a Long Task that tanks your INP score. Web Workers are better for pure computation (no DOM access needed), but scheduler.yield() is the right tool when you must stay on the main thread.`,
    diagramKey: 'frame',
    sceneKey: 'frameBudget',
    seoDescription: 'How browser frame budgets work: VSync, requestAnimationFrame, the 16ms and 10ms targets, Long Tasks, jank perception, and scheduler.yield().',
    pitfalls: [
      'At 120 Hz the budget is 8.33 ms per frame, not 16.67. High-refresh displays cut your window in half on the same hardware.',
      'Garbage collection and system jitter eat into the budget unpredictably. Aim for ~10 ms recurring work on 60 Hz to keep headroom.',
    ],
  },
  {
    id: 'http-caching',
    phase: 'Optimize',
    order: 15,
    title: 'HTTP Caching',
    subtitle: 'The fastest request is the one that never had to leave your device',
    example: `Browser asks: "Do I already have this? Is it still fresh?"

First visit to github.com/avatar.png:
→ GET /avatar.png
← 200 OK + Cache-Control: max-age=31536000 (cache for 1 year)
  Browser saves the response with an expiry date.

Second visit (within a year):
→ Browser: "I have it, it hasn't expired." Serves from memory. No network. No server.

After a year — or when GitHub deploys a new avatar URL:
→ GET /avatar-v2.png  ← new URL forces a fresh download
← 200 OK + new response. Cache updated.

This is cache busting: changing the filename invalidates the cache without header tricks.`,
    facts: [
      ['Cache-Control: max-age', 'Tells every cache — browser, CDN, proxy — how many seconds to trust the stored copy. max-age=0 means always revalidate. max-age=31536000 (1 year) is the maximum meaningful value.'],
      ['ETag (entity tag)', 'A fingerprint of the response content. Browser stores it and sends it on future requests: "If-None-Match: etag". If unchanged, server replies 304 Not Modified with no body — saving bandwidth without removing caching.'],
      ['Cache-Control: immutable', 'Signals that this URL\'s content will never change. Browsers skip the conditional revalidation request entirely — not even an If-None-Match check. Correct only for content-hashed assets (/app.a1b2c3.js) where a different URL means different content.'],
      ['stale-while-revalidate', 'Serve the cached copy immediately (fast), while fetching a fresh copy in the background for the next request. Best of both: users always get a response instantly, content eventually becomes fresh.'],
      ['Service Worker cache', 'JavaScript-controlled cache completely separate from the HTTP cache. Your code decides what to cache, for how long, and how to serve it. Can override HTTP cache headers entirely.'],
      ['Vary header', 'Tells caches that the response varies by a request header — e.g. Vary: Accept-Language means separate cached versions exist for each language. Misuse causes cache fragmentation and low hit ratios.'],
    ],
    insight: `Cache-Control: immutable is massively underused. If you serve assets with content-hashed filenames (/app.a1b2c3d4.js), the same content can never exist at a different URL by design — the hash changes when the content changes. Adding immutable tells every browser and CDN to never even send a conditional revalidation request. On a page with 20 hashed assets, this eliminates 20 network round trips on every repeat visit for users who already have the assets cached. One header, substantial improvement.`,
    diagramKey: 'cache',
    sceneKey: 'cache',
    seoDescription: 'How HTTP caching works: Cache-Control max-age, ETags, immutable flag, stale-while-revalidate, cache busting, and Service Worker cache.',
    codeDemo: {
      label: 'Caching Strategy',
      bad: `<!-- Filename never changes — browser re-downloads on every deploy -->
<script src="/app.js"></script>
<link rel="stylesheet" href="/styles.css" />

<!-- Response header forces revalidation every time -->
Cache-Control: no-cache`,
      good: `<!-- Content-hashed filenames — URL changes only when content changes -->
<script src="/app.a1b2c3d4.js"></script>
<link rel="stylesheet" href="/styles.9f8e7d6c.css" />

<!-- Browser trusts this forever — URL is the version signal -->
Cache-Control: max-age=31536000, immutable`,
    },
  },
  {
    id: 'cdn-edge',
    phase: 'Optimize',
    order: 16,
    title: 'CDN & Edge',
    subtitle: 'Putting your content closer to the people who need it',
    example: `Without a CDN, every request travels to one server:
User in Tokyo → 200ms → server in Virginia → 200ms back = 400ms round trip

With a CDN, content lives in 200+ locations worldwide:
User in Tokyo → 5ms → CDN edge in Tokyo → 5ms back = 10ms round trip

How it works:
1. First Tokyo request → CDN edge has no cache → passes through to your origin server
2. Origin responds → CDN edge caches the response in Tokyo
3. All subsequent Tokyo requests → served from Tokyo edge. Your origin never sees them.

For static files (JS, CSS, images) this eliminates most of your origin load.
Modern CDNs also run JavaScript at the edge — same latency win, for dynamic logic.`,
    facts: [
      ['Points of Presence (PoPs)', 'CDN edge locations distributed globally. Major CDNs (Cloudflare, Fastly, CloudFront) have 200–300+ PoPs. More PoPs means fewer users experiencing high-latency cache misses.'],
      ['Cache hit ratio', 'The % of requests served from edge cache vs forwarded to your origin. 90%+ is healthy. Below 80% means your origin is doing most of the work — defeating the CDN\'s purpose. Improve with longer max-age and smarter cache key design.'],
      ['Anycast routing', 'CDNs announce all their PoPs under the same IP range. DNS resolves "cdn.example.com" to the nearest edge automatically — no geographic routing logic needed in your app.'],
      ['Edge Functions', 'JavaScript or WASM running at CDN edge locations. Same latency advantage as static content, but for server logic: A/B tests, authentication checks, request rewriting, personalisation. Replaces origin round trips for dynamic responses.'],
      ['Cache Key design', 'The cache key determines when two requests share the same cached response. Cookies and query strings often appear in cache keys by default — personalized responses bypass the cache entirely. Strip irrelevant cookies and normalize query strings to maximize hit ratio.'],
      ['Origin shield', 'An extra caching layer between all CDN edges and your origin server. When multiple edges miss cache simultaneously (thundering herd), the shield collapses the requests into one origin call. Dramatically reduces origin load during cache misses.'],
    ],
    insight: `Cache hit ratio is the single metric that determines whether your CDN is actually helping. A CDN at 60% hit ratio still forwards 40% of traffic to your origin — the latency saving is only partial, and you're paying CDN fees for traffic that doesn't benefit. High hit ratios require: long max-age on content, careful cookie stripping (personalized cookies make every request unique), query string normalization, and separating static from dynamic endpoints. Audit your CDN's cache analytics before assuming "we have a CDN" means the problem is solved.`,
    diagramKey: 'cdn',
    sceneKey: 'cdn',
    seoDescription: 'How CDNs and edge networks work: points of presence, cache hit ratios, anycast routing, edge functions, cache key design, and origin shields.',
  },
  {
    id: 'resource-hints',
    phase: 'Network',
    order: 101,
    title: 'Resource Hints',
    subtitle: 'Telling the browser what it needs before it knows it needs it.',
    example: `Resource hints are tiny <link> tags in <head> that promote a future fetch in advance — before the parser reaches the tag that needs it. Each one targets a different stage of the connection lifecycle.

<link rel="dns-prefetch" href="//fonts.gstatic.com"> resolves DNS only. It is cheap, fire-and-forget, and useful when you know you'll hit many third-party origins. Typical savings: 20–120 ms per first request to that origin.

<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin> does the full TCP + TLS handshake on top of DNS. The next request to that origin skips the entire handshake — often 100–500 ms saved. Use it for a small number of critical origins; each open connection costs memory on both ends.

<link rel="preload" as="font" href="/fonts/sans.woff2" type="font/woff2" crossorigin> fetches a specific resource at high priority for imminent use — critical CSS, fonts, the LCP image. preload competes for bandwidth with the current page, so reserve it for resources you know you'll use this navigation. Forgetting the right as / type / crossorigin combination makes the browser fetch the resource a second time when it's actually needed.

<link rel="prefetch" href="/next-page.html"> grabs something at idle priority — a likely-next navigation target. The new Speculation Rules API generalises this with declarative JSON rules and a real prerender mode that loads and runs the destination in a hidden tab.

Every hint trades bandwidth from somewhere else. Over-hinting starves the resources you actually need now.`,
    facts: [
      ['dns-prefetch', '20–120 ms saved per first request to a new origin'],
      ['preload as=', 'style · script · font · image · fetch · document'],
      ['fetchpriority', 'high · low · auto — refines hint priority'],
      ['preconnect cost', '1× DNS + 1× TCP + 1× TLS — ~100–500 ms saved'],
      ['over-hinting', 'every hint competes for bandwidth right now'],
      ['fonts gotcha', 'preload needs as=font + type + crossorigin or it fetches twice'],
    ],
    insight: `Resource hints are a budget tool, not magic. Every hint borrows bandwidth, sockets, and main-thread time from something else on the current page — so promote only the resources whose absence would gate the LCP. The right number of hints on a typical page is small and deliberate.`,
    diagramKey: 'resource-hints-diagram',
    sceneKey: 'resource-hints-scene',
    seoDescription: 'How resource hints work: preload, prefetch, preconnect, dns-prefetch, and the Speculation Rules API for telling the browser what to fetch ahead of time.',
    step: 1,
    globalOrder: 9,
    hook: 'preload, prefetch, preconnect, dns-prefetch — small <link> tags that buy you milliseconds. Use them as a budget, not as a sprinkle.',
    newConcept: true,
    source: 'wf',
    codeDemo: {
      label: 'Preload critical fonts',
      bad: `<!-- Font is discovered late, after CSS parses and the @font-face rule resolves. -->
<head>
  <link rel="stylesheet" href="/styles.css">
</head>

/* styles.css */
@font-face {
  font-family: "Sans";
  src: url("/fonts/sans.woff2") format("woff2");
  font-display: swap;
}`,
      good: `<!-- Tell the browser about the font before CSS parses. -->
<head>
  <link
    rel="preload"
    href="/fonts/sans.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  >
  <link rel="stylesheet" href="/styles.css">
</head>`,
    },
  },
  {
    id: 'resource-loading-priorities',
    phase: 'Network',
    order: 102,
    title: 'Resource Loading & Priorities',
    subtitle: 'Every fetch has a priority. Most of the time the browser is right. Sometimes it is not.',
    example: `The browser assigns a priority to every resource as it discovers it: Highest (the HTML document, render-blocking CSS), High (defer/async scripts, fonts, viewport images), Medium (in-viewport images that aren't LCP), Low (preload as=fetch, lazy media), Lowest (lazy-loaded offscreen images).

That ordering decides which sockets get the next bytes when HTTP/2 multiplexes streams over a single connection. Get it wrong and the LCP image waits behind a tracking script.

fetchpriority="high" on a <link>, <script>, or <img> overrides the default. The most common use is the LCP image — tag it explicitly so it isn't demoted behind other in-viewport images. Conversely, fetchpriority="low" on a non-critical preload stops it from stealing bandwidth from rendering work.

Code splitting changes what is even discoverable up front. A dynamic import() returns a Promise and creates its own chunk that is fetched on demand — usually triggered by a route change, an idle callback, or a user interaction. React.lazy() wraps this pattern around components. Vendor chunks (React, lodash) get their own bundle so they cache independently from frequently-changing app code.

For scripts, <script defer> downloads in parallel with parsing, runs after the DOM is fully built, and preserves document order. <script async> downloads in parallel and runs whenever it's ready — order is undefined. defer is the right default; async is only for fully independent scripts like analytics.

Lazy-loading hurts the wrong things if you apply it everywhere. Above-the-fold images — especially the LCP — must not have loading="lazy". A lazy LCP image waits for the layout pass before requesting bytes; that delay shows up directly in the LCP metric.`,
    facts: [
      ['fetchpriority', 'high · low · auto — overrides browser default'],
      ['dynamic import()', 'Promise-returning · creates a separate chunk'],
      ['defer vs async', 'defer = ordered, after DOM ready · async = first-come, any order'],
      ['LCP image', 'preload + fetchpriority=high · DO NOT lazy-load'],
      ['vendor chunks', 'split rarely-changing deps so cache survives app updates'],
    ],
    insight: `Priority is a hint, not an instruction — the browser still decides what gets bytes next based on network conditions, connection state, and what is actually rendering. fetchpriority lets you nudge that decision; abusing it makes everything urgent, which is the same as nothing being urgent.`,
    diagramKey: 'resource-loading-priorities-diagram',
    sceneKey: 'resource-loading-priorities-scene',
    seoDescription: 'How browsers prioritize resource loading: fetchpriority, code splitting via dynamic import, vendor chunks, defer vs async, and why lazy-loading the LCP image is a mistake.',
    step: 1,
    globalOrder: 10,
    hook: 'The browser assigns a priority to every fetch. Override the default only when you know better — like the LCP image, which must never be lazy.',
    newConcept: true,
    source: 'wf',
    codeDemo: {
      label: "Don't lazy-load your LCP image",
      bad: `<!-- Lazy LCP — waits for layout before requesting bytes. -->
<img
  src="/hero.jpg"
  alt="Hero"
  loading="lazy"
>`,
      good: `<!-- Preloaded, high priority, never lazy. -->
<link
  rel="preload"
  as="image"
  href="/hero.jpg"
  fetchpriority="high"
>
<img
  src="/hero.jpg"
  alt="Hero"
  fetchpriority="high"
>`,
    },
  },
  {
    id: 'scripts-during-parsing',
    phase: 'Browser',
    order: 103,
    title: 'Scripts during parsing',
    subtitle: 'Where V8 first enters the journey — and what it costs to halt the parser.',
    example: `The HTML parser builds the DOM token by token. When it reaches a <script> without defer or async, it stops. The script is fetched (if external), then parsed and executed synchronously by V8 — all before the parser is allowed to move on.

While that script runs, it can synchronously inject markup into the open stream, mutate nodes the parser already produced, or query elements that haven't been parsed yet. The parser holds. Anything below the script in the document — content, styles, the LCP image — is invisible to the renderer until the script returns.

defer changes the contract. The script downloads in parallel with parsing and runs after the DOM is built, in document order. async also downloads in parallel but runs as soon as the bytes arrive — any order. <script type="module"> is defer by default and resolves its imports before execution. For anything other than tiny inline bootstraps, defer is the right answer.

This is where V8 first runs in the page lifecycle. Every script execution finishes by draining the microtask queue: Promise resolutions, queueMicrotask callbacks, MutationObserver entries. Microtasks flush after every script and before the parser yields back to the browser — a tight chain of resolved Promises can hold rendering hostage as completely as a synchronous loop.

CSS interleaves with this too. CSS the parser hasn't reached doesn't block JavaScript parsing. CSS that is already loading does block JavaScript execution — because the script might call getComputedStyle and the browser refuses to lie. That coupling is why a slow stylesheet can stall an inline script that never touches styles.

Long inline scripts in <head> are the easiest way to delay first paint without realising. Move them below the fold, or defer them, or skip them.`,
    facts: [
      ['sync <script>', 'parser blocks for fetch + parse + execute'],
      ['defer', 'parallel fetch · runs after DOM, in order'],
      ['async', 'parallel fetch · runs ASAP, any order'],
      ['modules', 'deferred by default · imports resolve before execution'],
      ['microtask flush', 'after every script · before the next task'],
      ['CSS coupling', 'in-flight CSS blocks JS execution that might query styles'],
    ],
    insight: `The parser is the boss of the document — every <script> without defer or async is asking permission to interrupt it. The browser grants the request, runs your code, and the page waits. Defer the request, and the parser keeps moving.`,
    diagramKey: 'scripts-during-parsing-diagram',
    sceneKey: 'scripts-during-parsing-scene',
    seoDescription: 'How <script> tags interact with the HTML parser: parser blocking, defer, async, modules, microtask flushes, and why V8 first runs here.',
    step: 2,
    globalOrder: 13,
    hook: 'A synchronous <script> tag stops the parser cold while V8 fetches, parses, and runs it. defer keeps the parser moving and runs scripts in order, after the DOM is built.',
    newConcept: true,
    source: 'hbr',
    codeDemo: {
      label: "Don't block the parser",
      bad: `<!-- Sync script in <head> — blocks parsing AND first paint. -->
<head>
  <script src="/big-app.js"></script>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <h1>Hello</h1>
</body>`,
      good: `<!-- Parallel fetch, runs after DOM is built. -->
<head>
  <script src="/big-app.js" defer></script>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <h1>Hello</h1>
</body>`,
    },
  },
  {
    id: 'style-recalculation',
    phase: 'Render',
    order: 104,
    title: 'Style recalculation',
    subtitle: 'Resolving which rules apply, and what the final values actually are.',
    example: `Style recalculation is the step where every dirty DOM node figures out its ComputedStyle. The engine walks the matched rules — applying specificity, then cascade origin, then @layer order, then declaration order — and inheritance fills in whatever the cascade didn't.

After the cascade comes resolution. Custom properties (--color) collapse to their concrete value. Relative units convert: em to px against the element's own font-size, % against the parent or containing block, vw against the viewport. The output is a flat ComputedStyle object hanging off the node — what layout reads when it runs.

Cost scales with two things at once: how many nodes are dirty, and how complex the selectors are. Browsers use bloom filters and selector hashing to reject the vast majority of rules in constant time, but deeply nested descendant combinators (.app .container .row .card .header .title) still force the matcher to walk up ancestor chains for every candidate. Sibling combinators (~, +) are worse — invalidating a child can dirty its siblings.

When DevTools profiling shows long "Recalculate Style" slices, three knobs help. Flatten selectors so most rules match in one hash lookup. Shrink the invalidation surface — toggle a class on a small subtree rather than mutating an attribute on <html>. And avoid synchronous style churn in tight loops, which forces a recalculation on every iteration.

@scope and :scope cap how far a selector can reach upward. Scoped CSS (Shadow DOM, CSS Modules) gives the engine smaller universes to match against, which is why it stays cheap even on enormous component trees.`,
    facts: [
      ['output', 'ComputedStyle per node — what layout reads'],
      ['cost ∝', 'dirty subtree size × selector complexity'],
      ['bloom filters', 'fast rejection · still O(selectors) worst case'],
      ['em / vw / %', 'all resolved to px here, against the right reference'],
      ['scope', ':scope and @scope cap selector reach'],
      ['custom properties', 'resolved at this step, per element'],
    ],
    insight: `Selector complexity is not theoretical — it is runtime cost paid every time anything in that subtree changes. A flat class is one hash lookup. A four-deep combinator is a walk up the tree for every candidate, every recalc.`,
    diagramKey: 'style-recalculation-diagram',
    sceneKey: 'style-recalculation-scene',
    seoDescription: 'How style recalculation works: cascade resolution, inheritance, ComputedStyle output, bloom filters, selector complexity, and the cost of dirty subtrees.',
    outputs: { label: 'output', type: 'ComputedStyle' },
    pitfalls: [
      'Deeply nested combinators (.a .b .c .d) defeat the engine\'s bloom-filter fast-rejection. Flat classes match in near-O(1).',
      'Toggling a class on <body> invalidates every descendant — the entire DOM. Scope class changes to the smallest subtree that needs them.',
    ],
    step: 3,
    globalOrder: 14,
    hook: 'After the DOM and CSSOM are built, the engine resolves which rules apply to which node and computes the final values. The output feeds layout directly.',
    newConcept: true,
    source: 'hbr',
    codeDemo: {
      label: 'Flat selectors over deep combinators',
      bad: `/* Four-deep descendant chain. Matcher walks ancestors per candidate. */
.app .container .row .card .header .title {
  font-size: 1rem;
  color: var(--ink);
}`,
      good: `/* Flat class. One hash lookup, no walking. */
.card-title {
  font-size: 1rem;
  color: var(--ink);
}`,
    },
  },
  {
    id: 'layout-tree-construction',
    phase: 'Render',
    order: 105,
    title: 'Layout tree construction',
    subtitle: 'Filtering the DOM into the boxes that actually need geometry.',
    example: `The render tree filtered out elements with no visual role — <head>, <script>, <meta>. The layout tree (Chromium calls the nodes LayoutObjects) is the second filter: it keeps only nodes that participate in geometry, and adds generated content the engine creates on the fly.

display:none removes an element and its entire subtree from the layout tree. The element exists in the DOM, has a ComputedStyle, and can still be queried — but it owns no box, costs nothing to lay out, and contributes nothing to its parent's size.

display:contents is the strange one. The element itself drops its box, but its children are promoted to participate in the parent's layout as direct siblings. Useful for unwrapping wrapper <div>s that exist only for grouping; subtle when combined with flex or grid because the children now answer to the grandparent's layout context.

visibility:hidden keeps the box. The element is in the layout tree, takes up its full space, but paints nothing. Toggling visibility is cheaper than toggling display because the layout tree is stable.

Each LayoutObject carries a pointer to the ComputedStyle of its DOM node. That pointer is the bridge between the cascade and geometry — layout reads ComputedStyle, geometry results write back to a fragment tree, paint walks both.

Pseudo-elements (::before, ::after) are generated here. They aren't in the DOM, but they get LayoutObjects, participate in flex and grid, can match CSS rules, and contribute to ink. Flex and grid containers are recognised at this point too — children are tagged with their containing layout context before layout proper starts the geometry math.`,
    facts: [
      ['display:none', 'subtree omitted from layout · cheapest hide'],
      ['display:contents', 'element box gone · children promoted to parent'],
      ['visibility:hidden', 'box kept, takes space · skips paint'],
      ['LayoutObject → ComputedStyle', 'pointer · the bridge to geometry'],
      ['pseudo-elements', '::before / ::after get their own boxes here'],
    ],
    insight: `The smallest the layout tree gets is when whole branches don't render — and that's free performance. display:none isn't a hack; it's a contract with the browser that this subtree doesn't need geometry, paint, or compositor work this frame.`,
    diagramKey: 'layout-tree-construction-diagram',
    sceneKey: 'layout-tree-construction-scene',
    seoDescription: 'How the layout tree is built: LayoutObjects, display none vs visibility hidden vs display contents, pseudo-elements, and the ComputedStyle pointer.',
    outputs: { label: 'output', type: 'LayoutObject tree' },
    step: 3,
    globalOrder: 16,
    hook: 'The layout tree is the DOM filtered down to nodes that actually need geometry — and the place where generated content (::before, ::after) becomes real.',
    newConcept: true,
    source: 'hbr',
    codeDemo: {
      label: 'When you really want it gone',
      bad: `/* Still in the layout tree. Still takes space. */
.offscreen-list {
  visibility: hidden;
}`,
      good: `/* Out of the layout tree entirely — or skipped until needed. */
.offscreen-list {
  display: none;
}

/* Or, for content that should come back when scrolled near: */
.long-section {
  content-visibility: auto;
}`,
    },
  },
  {
    id: 'containment',
    phase: 'Render',
    order: 106,
    title: 'Containment',
    subtitle: 'Drawing a line around a subtree and telling the browser: the outside cannot see in.',
    example: `CSS containment is a promise. You tell the engine that whatever happens inside this element won't affect anything outside — its size, its layout, its paint, its scoped counters. The engine accepts the promise and stops propagating changes at the boundary.

contain: layout isolates internal layout. A child resizing inside a contained ancestor cannot ripple up to its grandparent's layout, even if the cascade theoretically allows it. The layout engine simply stops walking outward.

contain: paint clips paint to the element's box and isolates its painting from neighbours. Combined with layout, it caps the blast radius for most updates: a hover effect, a class flip, an animation that touches text inside the container won't dirty paint regions elsewhere on the page.

contain: style scopes counter and quote values. contain: size requires the element to declare its own intrinsic size — children no longer influence the box.

contain: strict bundles all four (layout + paint + style + size) and is the strongest form. It is what virtualised lists, off-screen widgets, and heavy data tables want — anything where the engine should be free to treat the subtree as a sealed unit.

content-visibility: auto is the cousin. It says: skip rendering this element entirely until it scrolls near the viewport. The browser still reserves space (using contain-intrinsic-size as the hint), but doesn't recalc style, lay out children, or paint until needed. On long pages with many independent sections, this can be the single biggest win.

Containment is not free elsewhere. An inherently expensive component is still expensive — but the cost no longer leaks into the rest of the page on every interaction.`,
    facts: [
      ['contain: layout', "internal layout doesn't escape"],
      ['contain: paint', 'paint clipped + isolated'],
      ['contain: strict', 'layout + paint + style + size — sealed'],
      ['content-visibility: auto', 'skip rendering off-screen entirely'],
      ['typical use', 'virtualised lists, heavy widgets, data tables'],
    ],
    insight: `Containment is a contract — you promise the engine that nothing inside affects the outside, and the engine rewards you with smaller invalidation regions. Misapply it and you'll see clipped overflow or sized-out children; apply it where it's true and frames get cheaper.`,
    diagramKey: 'containment-diagram',
    sceneKey: 'containment-scene',
    seoDescription: 'How CSS containment works: contain layout, paint, style, size, strict, plus content-visibility, and how each caps the blast radius of a change.',
    pitfalls: [
      'Containment only helps if the engine respects it. contain: layout requires a containing block and a defined size. Verify in Layout profiling — don\'t trust the declaration alone.',
    ],
    step: 4,
    globalOrder: 18,
    hook: 'Tell the browser the inside of this element cannot affect the outside, and the layout engine will stop propagating changes at its edge.',
    newConcept: true,
    source: 'hbr',
    codeDemo: {
      label: 'Cap the blast radius',
      bad: `/* Nothing isolated. A mutation inside a card can ripple
   up to the list, the page, and back down to every sibling. */
.card-list { }
.card { }`,
      good: `/* The list isolates layout and style.
   Each card isolates layout and paint. */
.card-list {
  contain: layout style;
}
.card {
  contain: layout paint;
}`,
    },
  },
  {
    id: 'display-lists',
    phase: 'Render',
    order: 107,
    title: 'Paint records & display lists',
    subtitle: "Geometry doesn't make pixels — draw commands do.",
    example: `Paint walks the layout result and records a flat, ordered sequence of drawing operations. Chromium calls the output a cc::DisplayItemList — a serialisable list of "fill this rect", "draw this text", "apply this shadow", "clip to this path", "blit this image".

The order is the painter's algorithm in disguise. Backgrounds before text. Content before overlays. Stacking contexts collapse their interior into a single contiguous range so the compositor can later treat them as a unit.

This phase is not pixels. Nothing is rasterised yet. The display list is a recipe — small, cheap to replay, cheap to ship to the GPU, and cheap to re-execute at a different scale or DPR. Rasterization, the next step, is where commands become bitmap tiles.

Heavy visual effects add both more items and more raster cost. A 4px box-shadow records one shadow op and rasters a tight blur. A 40px shadow records one op too — but the raster work scales with the blur kernel and the affected area. Filters, masks, large border-radius clips, complex gradients all cost more here. Long Paint slices in DevTools mean either too many items or too-expensive items; the fix is almost always simplification, not parallelisation.

Text is the most expensive single op kind in practice. Shaping, hinting, sub-pixel positioning, ligature resolution, and emoji fallback chains all live inside one "draw text" command — and run on every paint that touches it.`,
    facts: [
      ['output', 'cc::DisplayItemList — flat ordered draw ops'],
      ['ops include', 'fill · stroke · text · shadow · clip · mask · image'],
      ['order', "back-to-front · painter's algorithm"],
      ['not pixels', 'rasterization is the next step'],
      ['text', 'shaping + hinting + fallback — the most expensive op'],
    ],
    insight: `Blur radius scales the work — a 4px shadow is cheap, a 40px shadow is a wall. The display list grew by one item; the rasteriser now has to fill a hundred times the area.`,
    diagramKey: 'display-lists-diagram',
    sceneKey: 'display-lists-scene',
    seoDescription: 'How paint records draw commands into a display list: cc::DisplayItemList, painter ordering, and why the display list is a recipe — not pixels yet.',
    outputs: { label: 'output', type: 'cc::DisplayItemList' },
    pitfalls: [
      'Heavy effects (shadows, blurs, masks) add more display items AND more raster cost. Optimize paint commands before chasing JavaScript.',
    ],
    step: 5,
    globalOrder: 19,
    hook: 'Paint produces a flat, ordered list of draw commands — not pixels. That list is what the rasteriser will execute next.',
    newConcept: true,
    source: 'hbr',
  },
  {
    id: 'stacking-contexts',
    phase: 'Render',
    order: 108,
    title: 'Stacking contexts',
    subtitle: 'Where z-index actually starts over — and why your overlay still does not sit on top.',
    example: `A stacking context is a subtree of the layout tree that forms its own z-axis ordering scope. Children sort against each other inside the context using their own z-index values. The entire group then participates in its parent's ordering as one atomic unit — its internal z-index numbers are invisible to the outside.

Several properties create one. The classic trigger is position: relative / absolute / fixed with a non-auto z-index. The surprising triggers are everywhere: any transform (even transform: translateZ(0)), any filter, any opacity less than 1, isolation: isolate, will-change for a stacking-creating property, and — most often missed — flex or grid children with z-index set, where you don't even need position.

Once a stacking context exists, a descendant cannot escape it. A child with z-index: 9999 still sorts below its parent's siblings if the parent is in a lower context. This is the source of nearly every "my modal isn't on top" bug: a sibling element earlier in the document accidentally created a stacking context, and the modal lives inside something underneath it.

The compositor cares about contexts too. They are how it decides what can be promoted into its own layer, how it can squash neighbouring elements into shared backing stores, and how it preserves correct ordering when those layers animate independently.

DevTools Elements panel → Layers (and the 3D view in Rendering) is the fastest way to see the actual tree. When ordering goes wrong, the boundary is always there.`,
    facts: [
      ['triggers', 'opacity < 1 · transform · filter · isolation · z-index w/ position'],
      ['surprise', 'z-index on flex/grid children — no position needed'],
      ['boundary', "child z-index can't escape its parent's context"],
      ['atomic', 'whole context sorts as one unit against siblings'],
      ['devtools', 'Elements → Layers reveals the actual tree'],
    ],
    insight: `Every transform creates a stacking context — which is how compositing decides what can be promoted to its own layer. That single line, "transform: translateZ(0)", was never really about the GPU. It was about creating a boundary the compositor could trust.`,
    diagramKey: 'stacking-contexts-diagram',
    sceneKey: 'stacking-contexts-scene',
    seoDescription: 'How CSS stacking contexts work: what creates them, z-index isolation, why overlays sometimes refuse to sit on top, and how the compositor uses contexts.',
    pitfalls: [
      'Opacity < 1, transform, filter, and z-index on flex/grid children all silently create a stacking context. A child\'s z-index: 9999 cannot escape its parent\'s context — a common debugging trap.',
    ],
    step: 5,
    globalOrder: 20,
    hook: 'A stacking context is its own z-axis universe. z-index inside it cannot escape — which is why your overlay sometimes refuses to sit on top.',
    newConcept: true,
    source: 'hbr',
  },
  {
    id: 'property-trees',
    phase: 'Render',
    order: 109,
    title: 'Property trees & pre-paint',
    subtitle: 'How the compositor knows what to redo without redoing everything.',
    example: `Between paint and compositing sits a phase Chromium calls pre-paint. It walks the layout result and builds property trees — five of them, conceptually: Transform, Clip, Effect, Opacity, and Scroll. The internal type is cc::PropertyTree.

Instead of deciding "this element gets a composited layer because it has opacity < 1" up front, the engine records the effect hierarchy as abstract nodes. Every painted item carries a reference to the chain of property-tree nodes that apply to it: which transforms it inherits, which clips contain it, which effects wrap it, which scrollers move it.

This is the foundation of Composite After Paint (CAP). Paint first, layerise after, with the property trees telling the layerisation step what could be safely grouped and what must stay independent.

The payoff is targeted updates. When opacity changes on a single element, the engine doesn't repaint or relayout — it mutates a value on the Effect tree and the compositor re-applies it on the next frame. When a transform animates, the Transform tree node is updated on the compositor thread and the GPU just repositions the existing texture. Style, layout, and paint all sleep through that frame.

When DevTools shows "Composite Only" updates, this is the mechanism. The display list didn't change; only the property tree did.`,
    facts: [
      ['trees', 'Transform · Clip · Effect · Opacity · Scroll'],
      ['chromium type', 'cc::PropertyTree'],
      ['enables', 'compositor-only updates (no repaint)'],
      ['CAP', 'Composite After Paint — paint first, layerise after'],
      ['records', 'effect chain per painted item, not eager layers'],
    ],
    insight: `Property trees are why transform and opacity animations stay cheap. They touch the tree, not the paint — and the compositor replays the previous frame's pixels with new values baked in.`,
    diagramKey: 'property-trees-diagram',
    sceneKey: 'property-trees-scene',
    seoDescription: 'How pre-paint and property trees work: Transform, Clip, Effect, Opacity, Scroll trees, cc::PropertyTree, Composite After Paint, and compositor-only updates.',
    outputs: { label: 'output', type: 'cc::PropertyTree' },
    step: 5,
    globalOrder: 21,
    hook: 'Pre-paint records the effect hierarchy as abstract property-tree nodes. That structure is what makes transform and opacity animations almost free.',
    newConcept: true,
    source: 'hbr',
  },
  {
    id: 'layer-promotion',
    phase: 'Render',
    order: 110,
    title: 'Layer promotion',
    subtitle: 'When paint output graduates to its own composited surface.',
    example: `After paint and pre-paint, the engine decides which display-list chunks become composited layers — their own GPU-backed surfaces the compositor can move, fade, and combine independently. Chromium's output type is cc::Layer.

Composite After Paint (CAP, Chrome 94+) flipped the order on the old engine. It paints first, then groups paint chunks that share compatible property-tree state into layers. The old engine guessed up front and was often wrong; CAP measures and is usually right.

Promotion is either explicit or implicit. Explicit: you asked for it via will-change: transform, will-change: opacity, transform: translateZ(0), or implicitly by using position: fixed. Implicit: the compositor needs a separate surface because an element overlaps a promoted layer and z-order must be preserved — promoting it is cheaper than recomputing the underlying layer on every frame.

Implicit promotions are the source of most "where did all these layers come from" surprises. A single will-change on a header can cause every overlapping card below to acquire its own layer.

Each layer carries cost. A GPU texture of width × height × 4 bytes (uncompressed RGBA), the bandwidth to commit and present it, the scheduler overhead of raster work for its tiles. Hundreds of layers on a phone is how you cook the GPU and earn checkerboarding.

The discipline is symmetrical to the trick: promote when you have an animation that needs its own surface, then remove will-change the moment it ends. Hinting forever is paying GPU rent for a one-second transition.`,
    facts: [
      ['explicit', 'will-change · transform: translateZ(0) · position: fixed'],
      ['implicit', 'overlap with a promoted layer + z-order to preserve'],
      ['cost per layer', 'GPU texture memory + raster + commit'],
      ['CAP', 'paint first, group compatible chunks, then layerise'],
      ['cleanup', 'remove will-change after the animation ends'],
    ],
    insight: `Every promoted layer is a promise to the GPU — keep it short. Will-change forever is a memory leak you pay in VRAM, not in JavaScript heap.`,
    diagramKey: 'layer-promotion-diagram',
    sceneKey: 'layer-promotion-scene',
    seoDescription: 'How browsers promote elements into composited layers: will-change, transform hacks, implicit promotion, GPU texture cost, and Composite After Paint.',
    outputs: { label: 'output', type: 'cc::Layer' },
    pitfalls: [
      'Each promoted layer costs GPU texture memory (w × h × 4 bytes) and commit coordination. * { transform: translateZ(0) } and * { will-change: transform } are the canonical layer explosions.',
      'Remove will-change after the animation ends. Otherwise every promoted node stays in GPU memory permanently.',
    ],
    step: 6,
    globalOrder: 23,
    hook: 'Promotion moves paint output into its own GPU surface. Cheap during an animation; expensive if you forget to clean up after.',
    newConcept: true,
    source: 'hbr',
  },
  {
    id: 'commit-and-compositor-thread',
    phase: 'Render',
    order: 111,
    title: 'Commit & the compositor thread',
    subtitle: 'The atomic handoff from main thread to GPU.',
    example: `Commit is the brief, atomic handover. The main thread copies the latest display list, property trees, and layer tree state into structures owned by the compositor thread — Chromium's cc::LayerTreeHost. For the duration of that copy, the main thread blocks. When commit finishes, JavaScript can run again immediately.

From that moment, the compositor thread owns the frame. It scrolls layers, advances transform and opacity animations, schedules raster work, and assembles compositor frames for the GPU — entirely independently of whether the main thread is busy. This is why a heavy React reconciliation can run for 200 ms while scroll and CSS-driven motion stay smooth: the compositor is on its own thread, not yours.

It is not unlimited. Raster workers still have to fill tiles, GPU bandwidth caps how much can be presented per frame, and the Viz process (the cross-process compositor that aggregates frames from all renderers and presents to the screen) has its own queue.

Large commits are real work. Many promoted layers, wide damage regions, big invalidations, huge tiles — the commit copy gets longer and the main thread blocks proportionally. Most of the time commit is sub-millisecond. When it isn't, the cure is fewer layers or smaller invalidation regions, not faster JavaScript.

Passive event listeners (addEventListener("touchstart", fn, { passive: true })) tell the browser the handler won't call preventDefault. The compositor is then free to scroll without waiting for the main thread to confirm. Omit the flag, and every touch acquires a lock on the main thread before the compositor can move a pixel — which is exactly how scroll jank gets created.`,
    facts: [
      ['handoff', 'main → compositor · atomic copy'],
      ['cc::LayerTreeHost', 'what the compositor owns after commit'],
      ['why scroll stays smooth', 'compositor scrolls without main-thread paint'],
      ['large commits cost', 'wide damage = real time, not free'],
      ['passive listeners', "{ passive: true } lets compositor scroll without waiting"],
    ],
    insight: `Animating transform is the compositor's job. Animating top is the main thread's headache. The handoff at commit is where that distinction starts paying off — or starts costing you frames.`,
    diagramKey: 'commit-and-compositor-thread-diagram',
    sceneKey: 'commit-and-compositor-thread-scene',
    seoDescription: 'How commit works: the atomic handoff from main thread to compositor thread, cc::LayerTreeHost, passive listeners, and why compositor-driven scroll stays smooth.',
    outputs: { label: 'output', type: 'cc::LayerTreeHost' },
    step: 6,
    globalOrder: 24,
    hook: 'Commit is the atomic copy that moves the frame from main thread to compositor. After it, the GPU side runs on its own clock.',
    newConcept: true,
    source: 'hbr',
  },
  {
    id: 'tiling-rasterization',
    phase: 'Render',
    order: 112,
    title: 'Tiling & rasterization',
    subtitle: 'Where draw commands finally become pixels.',
    example: `Promoted layers — Chromium calls the painted backing cc::PictureLayer — get split into fixed-size tiles. The typical logical tile is 256×256 CSS pixels; the actual device-pixel tile scales with devicePixelRatio, so a 256×256 logical tile is 512×512 device pixels at DPR 2.

Rasterization is the step that executes the display list for each tile into bitmap textures. The work runs on raster worker threads (CPU) and/or directly on the GPU through Skia, which targets the platform's modern API: Vulkan on Linux/Android, Metal on macOS/iOS, D3D12 on Windows.

Memory math is straightforward and brutal. Each tile is roughly width × height × 4 bytes (uncompressed RGBA). On many phones the GPU shares system RAM with the CPU, so big layers and many tiles eat into the same budget the rest of the app and the OS are using. A page with a few hundred promoted layers can consume hundreds of megabytes of VRAM before you notice.

Scrolling shifts which tiles matter. The compositor prioritises the ones near the viewport and decommissions ones far outside it. On heavy pages, a fast fling can outpace the raster workers — the page shows checkerboard placeholder tiles for a few frames until the bitmaps catch up.

Tile cost is paint cost in disguise. A full-screen fixed background, a heavy filter, an expensive mask — each enlarges the work the rasteriser has to do per tile. If the GPU profile is hot, simplifying paint upstream is almost always the fix; throwing more cores at it rarely helps.`,
    facts: [
      ['tile size', '~256×256 CSS px · device px scales with DPR'],
      ['raster path', 'Skia → GPU (Vulkan · Metal · D3D12)'],
      ['memory ≈', 'w × h × 4 bytes per tile · unified on mobile'],
      ['checkerboarding', 'fast scroll outpacing raster'],
      ['workers', 'raster runs on dedicated worker threads + GPU'],
    ],
    insight: `Tiling is the browser's batching strategy. Small dirty regions ship cheaply because only their tiles need re-rasterising; big ones don't, because every tile they touch has to be redrawn end to end.`,
    diagramKey: 'tiling-rasterization-diagram',
    sceneKey: 'tiling-rasterization-scene',
    seoDescription: 'How tiling and rasterization work: cc::PictureLayer, tile size, Skia targeting Vulkan/Metal/D3D12, raster workers, VRAM cost, and checkerboarding.',
    outputs: { label: 'output', type: 'GPU bitmap tiles' },
    step: 6,
    globalOrder: 25,
    hook: 'Promoted layers are split into tiles. Each tile is rasterised independently — on a worker thread, on the GPU, or both.',
    newConcept: true,
    source: 'hbr',
  },
  {
    id: 'vsync-display',
    phase: 'Optimize',
    order: 113,
    title: 'VSync & the display',
    subtitle: 'The heartbeat that times everything.',
    example: `Display hardware refreshes at a fixed rate. 60 Hz panels paint a new frame every 16.67 ms. 120 Hz phone displays and gaming monitors halve that to 8.33 ms. Variable refresh rate (VRR) panels — ProMotion, FreeSync — adjust the interval frame by frame within a range.

VSync is the vertical synchronisation signal the panel raises when it is ready to accept the next buffer. The browser's frame scheduler listens for that pulse and uses it as the heartbeat for the entire pipeline — rAF callbacks fire, style recalculates, layout runs, paint records, commit hands off to the compositor, the compositor presents the frame.

Hit VSync, and the user sees smooth motion. Miss it, and the panel re-displays the previous frame for another full interval. One miss at 60 Hz is 16.67 ms of stutter. Two consecutive misses crosses the threshold where most people notice. Animation jank is detected faster than navigation delay because the eye is tuned for motion discontinuities.

The frame budget shrinks under conditions you don't control. Thermal throttling on a phone halves CPU and GPU clocks. A 120 Hz display gives you half the time of a 60 Hz one for identical work. Background tabs and other apps compete for the same GPU. The "16 ms budget" is a starting point, not a guarantee.

This is why the only contract that matters is: be ready when VSync arrives. Everything upstream — JavaScript scheduling, style recalc, layout, paint, raster — exists to deliver a frame before the next pulse. Miss it, and the work was wasted anyway.`,
    facts: [
      ['60 Hz', '16.67 ms per frame'],
      ['120 Hz', '8.33 ms per frame'],
      ['vsync', 'vertical sync signal · scheduler heartbeat'],
      ['miss vsync', 'frame dropped or re-displayed · perceived stutter'],
      ['VRR', 'variable refresh — budget changes per frame'],
    ],
    insight: `The screen waits for no one. Everything upstream has to be ready when VSync arrives — and the budget shrinks whenever the user picks up a faster phone, holds the device too long, or opens another app.`,
    diagramKey: 'vsync-display-diagram',
    sceneKey: 'vsync-display-scene',
    seoDescription: 'How VSync and display refresh rates drive the rendering pipeline: 60 Hz vs 120 Hz frame budgets, VRR, dropped frames, and why the screen waits for no one.',
    step: 7,
    globalOrder: 27,
    hook: 'The panel raises VSync when it is ready for a new frame. Everything upstream — your JavaScript, the render pipeline, the compositor — exists to meet that deadline.',
    newConcept: true,
    source: 'hbr',
  },
  {
    id: 'service-workers',
    phase: 'Optimize',
    order: 17,
    title: 'Service Workers',
    subtitle: 'A programmable proxy between your app and the network',
    example: `A Service Worker is JavaScript running in a background thread, outside your page:

1. Registration — your page installs it once:
   navigator.serviceWorker.register('/sw.js')

2. Activation — it controls all future requests from this origin:
   self.addEventListener('install', e => e.waitUntil(
     caches.open('v1').then(c => c.addAll(['/', '/app.js', '/styles.css']))
   ))

3. Interception — every network request passes through it:
   self.addEventListener('fetch', e => {
     e.respondWith(caches.match(e.request) || fetch(e.request))
   })

Open the page with no internet: it serves from cache. Immediately.
The network never gets the chance to fail.`,
    facts: [
      ['Lifecycle: installing → waiting → activating → activated', 'A new Service Worker waits in "waiting" state if any tabs still use the old one. It only activates when all those tabs are closed — or you call skipWaiting() in install. This prevents serving different SW versions to different tabs simultaneously.'],
      ['Cache Storage API', 'Separate from the HTTP cache and completely JavaScript-controlled. Nothing expires automatically. Your code decides what to store, when to update it, and exactly how to respond — including synthesising entirely fake responses.'],
      ['Offline-first strategies', 'Cache-first: serve from cache, fall back to network. Network-first: try network, fall back to cache. Stale-while-revalidate: serve cache instantly, update in background. Each has different freshness/speed tradeoffs.'],
      ['Background Sync', 'Queue writes while offline. When connectivity returns, the SW sends them — even if the user has since closed the tab. Correct for form submissions, chat messages, or any write that must eventually reach the server.'],
      ['Push notifications', 'Servers can wake the SW and display a notification even when the site isn\'t open — as long as the user granted permission and the browser is running. Entirely separate from the page lifecycle.'],
      ['HTTPS only (and localhost)', 'Service Workers require HTTPS because they can intercept and rewrite every network request — too powerful to allow over an unauthenticated connection. Localhost is the only HTTP exception, for development.'],
    ],
    insight: `The Service Worker waiting state is one of the most common sources of "my update isn't showing up for users" bugs. A new SW waits until all tabs using the old version close — which on heavy users who never fully close tabs can mean days. The standard fix is skipWaiting() in install + clients.claim() in activate. But this is only safe if the new SW can serve the same cached assets the old pages were built against. Mismatching a new SW with old page HTML is how you get "the app loaded but nothing works" — because the cached JS the old page references was replaced by the new SW's cache.`,
    diagramKey: 'sw',
    sceneKey: 'sw',
    seoDescription: 'How service workers work: lifecycle, Cache Storage API, offline-first strategies, background sync, push notifications, and the skipWaiting trap.',
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
  // Navigate by globalOrder across the 28-concept tutorial sequence, so prev/next
  // flow through steps in the correct order regardless of insertion order in topics[].
  const ordered = topics
    .filter(t => TOPIC_STEP_MAP[t.id])
    .sort(
      (a, b) =>
        (TOPIC_STEP_MAP[a.id].globalOrder ?? 0) -
        (TOPIC_STEP_MAP[b.id].globalOrder ?? 0),
    )
  const idx = ordered.findIndex(t => t.id === slug)
  if (idx === -1) {
    // Fallback to legacy array-order behaviour for slugs not in the new map
    const lidx = topics.findIndex(t => t.id === slug)
    return {
      prev: lidx > 0 ? topics[lidx - 1] : null,
      next: lidx >= 0 && lidx < topics.length - 1 ? topics[lidx + 1] : null,
    }
  }
  return {
    prev: idx > 0 ? ordered[idx - 1] : null,
    next: idx < ordered.length - 1 ? ordered[idx + 1] : null,
  }
}

// Step assignment — maps each topic.id to its new step + position
export const TOPIC_STEP_MAP: Record<string, { step: number; order: number; globalOrder: number }> = {
  // Step 1 — Network & transport (8 existing + 2 new in Phase E = 10)
  "url-parsing":                  { step: 1, order: 1,  globalOrder: 1  },
  "service-workers":              { step: 1, order: 2,  globalOrder: 2  },
  "dns-resolution":               { step: 1, order: 3,  globalOrder: 3  },
  "tcp-connection":               { step: 1, order: 4,  globalOrder: 4  },
  "tls-handshake":                { step: 1, order: 5,  globalOrder: 5  },
  "http-request":                 { step: 1, order: 6,  globalOrder: 6  },
  "http-caching":                 { step: 1, order: 7,  globalOrder: 7  },
  "cdn-edge":                     { step: 1, order: 8,  globalOrder: 8  },
  "resource-hints":               { step: 1, order: 9,  globalOrder: 9  },
  "resource-loading-priorities":  { step: 1, order: 10, globalOrder: 10 },
  // Step 2 — Parsing (5 total). Scripts run during parsing, so V8 and the event loop
  // belong here — they are the heart of JS execution and earn their own concept pages.
  "html-parsing":                 { step: 2, order: 1,  globalOrder: 11 },
  "css-parsing":                  { step: 2, order: 2,  globalOrder: 12 },
  "scripts-during-parsing":       { step: 2, order: 3,  globalOrder: 13 },
  "v8-engine":                    { step: 2, order: 4,  globalOrder: 14 },
  "event-loop":                   { step: 2, order: 5,  globalOrder: 15 },
  // Step 3 — Style & tree construction (3 total)
  "style-recalculation":          { step: 3, order: 1,  globalOrder: 16 },
  "render-tree":                  { step: 3, order: 2,  globalOrder: 17 },
  "layout-tree-construction":     { step: 3, order: 3,  globalOrder: 18 },
  // Step 4 — Layout (2 total)
  "layout":                       { step: 4, order: 1,  globalOrder: 19 },
  "containment":                  { step: 4, order: 2,  globalOrder: 20 },
  // Step 5 — Paint (4 total)
  "display-lists":                { step: 5, order: 1,  globalOrder: 21 },
  "stacking-contexts":            { step: 5, order: 2,  globalOrder: 22 },
  "property-trees":               { step: 5, order: 3,  globalOrder: 23 },
  "paint":                        { step: 5, order: 4,  globalOrder: 24 },
  // Step 6 — Compositing (4 total)
  "layer-promotion":              { step: 6, order: 1,  globalOrder: 25 },
  "commit-and-compositor-thread": { step: 6, order: 2,  globalOrder: 26 },
  "tiling-rasterization":         { step: 6, order: 3,  globalOrder: 27 },
  "compositing":                  { step: 6, order: 4,  globalOrder: 28 },
  // Step 7 — Display (2 total)
  "vsync-display":                { step: 7, order: 1,  globalOrder: 29 },
  "frame-budget":                 { step: 7, order: 2,  globalOrder: 30 },
};

export const TOPIC_SOURCES: Record<string, "original" | "hbr" | "wf"> = {
  // Step 1
  "url-parsing": "original",
  "service-workers": "original",
  "dns-resolution": "original",
  "tcp-connection": "original",
  "tls-handshake": "original",
  "http-request": "original",
  "http-caching": "original",
  "cdn-edge": "original",
  "resource-hints": "wf",
  "resource-loading-priorities": "wf",
  // Step 2
  "html-parsing": "original",
  "css-parsing": "original",
  "scripts-during-parsing": "hbr",
  "v8-engine": "original",
  "event-loop": "original",
  // Step 3
  "style-recalculation": "hbr",
  "render-tree": "original",
  "layout-tree-construction": "hbr",
  // Step 4
  "layout": "original",
  "containment": "hbr",
  // Step 5
  "display-lists": "hbr",
  "stacking-contexts": "hbr",
  "property-trees": "hbr",
  "paint": "original",
  // Step 6
  "layer-promotion": "hbr",
  "commit-and-compositor-thread": "hbr",
  "tiling-rasterization": "hbr",
  "compositing": "original",
  // Step 7
  "vsync-display": "hbr",
  "frame-budget": "original",
};

export function getTopicStep(id: string) {
  return TOPIC_STEP_MAP[id];
}

export function getTopicsByStep(step: number): Topic[] {
  return topics
    .filter((t) => TOPIC_STEP_MAP[t.id]?.step === step)
    .sort((a, b) => (TOPIC_STEP_MAP[a.id]?.order ?? 0) - (TOPIC_STEP_MAP[b.id]?.order ?? 0));
}
