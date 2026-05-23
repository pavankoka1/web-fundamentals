export interface StepMeta {
  step: number;
  slug: string;
  title: string;
  arrow: string;
  lede: string;
  conceptCount: number;
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
