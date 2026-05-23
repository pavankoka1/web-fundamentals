"use client";
import { useEffect, useRef } from "react";
import { STEPS } from "@/lib/steps";

/**
 * PipelineOverview — Direction D
 *
 * A subtle Canvas-2D animation that visualises the 7-step browser pipeline.
 * Particles drift gently from left to right through each stage, then loop.
 *
 * Refactored from the legacy HeroScene:
 *  - Ice-cyan accent palette (no per-stage hues)
 *  - 7 step labels sourced from `STEPS` (NETWORK → DISPLAY)
 *  - Transparent background (parent owns the surface)
 *  - DPR-aware, ResizeObserver-driven
 *  - IntersectionObserver pauses the RAF loop when off-screen
 *  - Honours `prefers-reduced-motion` with a static dotted state
 */

const STAGE_LABELS = [
  "NETWORK",
  "PARSING",
  "STYLE",
  "LAYOUT",
  "PAINT",
  "COMPOSITING",
  "DISPLAY",
] as const;

const N = STAGE_LABELS.length;
const HOP_MS = 1500;
const PAUSE_MS = 750;
const UNIT_MS = HOP_MS + PAUSE_MS;
const CYCLE_MS = N * UNIT_MS;
const TRAIL = 26;

// Ice-cyan accent: var(--color-accent) === #7DD3FC
const ACCENT: [number, number, number] = [125, 211, 252];

function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
};

type TrailPt = { x: number; y: number };

// Sanity check at module load so a STEPS edit can't silently desync the visual.
if (process.env.NODE_ENV !== "production" && STEPS.length !== N) {
  // eslint-disable-next-line no-console
  console.warn(
    `[PipelineOverview] STAGE_LABELS length (${N}) does not match STEPS length (${STEPS.length}).`,
  );
}

export function PipelineOverview() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const t0Ref = useRef<number>(-1);
  const trailRef = useRef<TrailPt[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const visibleRef = useRef<boolean>(true);
  const reducedMotionRef = useRef<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0;
    let H = 0;

    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    reducedMotionRef.current = mql.matches;

    function resize() {
      if (!canvas || !wrap || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = Math.max(1, Math.round(W * dpr));
      canvas.height = Math.max(1, Math.round(H * dpr));
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      spawnParticles();
    }

    function spawnParticles() {
      particlesRef.current = Array.from({ length: 32 }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: Math.random() * 0.22 + 0.04, // gentle left-to-right drift
        vy: (Math.random() - 0.5) * 0.08,
        r: Math.random() * 1.2 + 0.4,
        alpha: Math.random() * 0.16 + 0.04,
      }));
    }

    function nodePos(i: number) {
      const idx = ((i % N) + N) % N;
      const padX = Math.max(W * 0.07, 28);
      const cx = padX + (idx / (N - 1)) * (W - padX * 2);
      const cy = H * 0.5;
      return { x: cx, y: cy };
    }

    function drawStaticState() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      // Connection line (single dim baseline)
      const first = nodePos(0);
      const last = nodePos(N - 1);
      ctx.beginPath();
      ctx.moveTo(first.x, first.y);
      ctx.lineTo(last.x, last.y);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"; // var(--color-border)
      ctx.lineWidth = 1;
      ctx.stroke();

      for (let i = 0; i < N; i++) {
        const { x, y } = nodePos(i);
        const r = Math.max(3.5, W * 0.0034);

        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, 0.55)`;
        ctx.fill();

        drawLabel(i, false);
      }
    }

    function drawLabel(i: number, active: boolean) {
      if (!ctx) return;
      const { x, y } = nodePos(i);
      const fs = Math.max(9, Math.min(11, W / 120));
      ctx.font = `500 ${fs}px 'Geist Mono', ui-monospace, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      const r = Math.max(4, W * 0.0048);
      // letter-spacing approximation via spaced label
      const label = STAGE_LABELS[i].split("").join(" ");
      ctx.fillStyle = active
        ? "rgba(125, 211, 252, 1)" // var(--color-accent)
        : "rgba(244, 244, 248, 0.45)"; // var(--color-text-muted)
      ctx.fillText(label, x, y + r + 14);
    }

    function radialGlow(
      x: number,
      y: number,
      r: number,
      alpha: number,
    ) {
      if (!ctx) return;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const [rr, gg, bb] = ACCENT;
      g.addColorStop(0, `rgba(${rr},${gg},${bb},${(alpha * 0.75).toFixed(3)})`);
      g.addColorStop(0.35, `rgba(${rr},${gg},${bb},${(alpha * 0.28).toFixed(3)})`);
      g.addColorStop(1, `rgba(${rr},${gg},${bb},0)`);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    }

    function frame(now: number) {
      if (!ctx) return;
      if (t0Ref.current < 0) t0Ref.current = now;
      if (!W || !H) {
        rafRef.current = requestAnimationFrame(frame);
        return;
      }

      ctx.clearRect(0, 0, W, H);

      const elapsed = (now - t0Ref.current) % CYCLE_MS;
      const seg = Math.floor(elapsed / UNIT_MS);
      const segFrac = (elapsed % UNIT_MS) / UNIT_MS;
      const hopFrac = Math.min(segFrac / (HOP_MS / UNIT_MS), 1);
      const inPause = segFrac > HOP_MS / UNIT_MS;
      const pauseFrac = inPause
        ? (segFrac - HOP_MS / UNIT_MS) / (PAUSE_MS / UNIT_MS)
        : 0;

      const fromIdx = seg % N;
      const toIdx = (seg + 1) % N;
      const wrapToStart = toIdx === 0 && fromIdx === N - 1;
      const from = nodePos(fromIdx);
      const to = nodePos(toIdx);
      const e = easeInOut(hopFrac);
      const px = from.x + (to.x - from.x) * e;
      const py = from.y + (to.y - from.y) * e;
      // Active stage: the node the particle is leaving while hopping,
      // or the node it has just arrived at during the pause.
      const activeIdx = inPause ? toIdx : fromIdx;

      // ── Ambient particles (left-to-right drift) ────────────────────────
      for (const p of particlesRef.current) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x > W + 8) {
          p.x = -8;
          p.y = Math.random() * H;
        }
        if (p.y < -8) p.y = H + 8;
        if (p.y > H + 8) p.y = -8;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${p.alpha.toFixed(3)})`;
        ctx.fill();
      }

      // ── Connection lines (between adjacent stage dots) ─────────────────
      for (let i = 0; i < N - 1; i++) {
        const a = nodePos(i);
        const b = nodePos(i + 1);
        const isActive = i === fromIdx && !wrapToStart;
        if (isActive) {
          ctx.strokeStyle = "rgba(125, 211, 252, 0.35)"; // var(--color-accent-line)
          ctx.lineWidth = 1.2;
        } else {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.08)"; // var(--color-border)
          ctx.lineWidth = 1;
        }
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Active segment: gentle progress line up to packet position
      if (!inPause && !wrapToStart) {
        const lg = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
        lg.addColorStop(0, `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},0.55)`);
        lg.addColorStop(e, `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},0.55)`);
        lg.addColorStop(Math.min(e + 0.001, 1), `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},0)`);
        lg.addColorStop(1, `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},0)`);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = lg;
        ctx.lineWidth = 1.6;
        ctx.stroke();
      }

      // ── Stage dots + labels ────────────────────────────────────────────
      for (let i = 0; i < N; i++) {
        const { x, y } = nodePos(i);
        const r = Math.max(4, W * 0.0048);
        const isActive = i === activeIdx;
        const isArrival = i === toIdx && inPause;

        // Subtle glow for active node
        if (isActive) {
          radialGlow(x, y, r * 5.5, isArrival ? 0.55 : 0.4);
        }

        // Staggered arrival pulse ring (single, gentle)
        if (isArrival) {
          const f = pauseFrac;
          if (f > 0) {
            const scale = 1 + f * 3.2;
            const a = (1 - f) * 0.45;
            ctx.beginPath();
            ctx.arc(x, y, r * scale, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${a.toFixed(3)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        const dotAlpha = isActive ? 1 : 0.5;
        ctx.fillStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${dotAlpha})`;
        ctx.fill();

        drawLabel(i, isActive);
      }

      // ── Packet trail (skip during wrap to first stage) ─────────────────
      if (!wrapToStart) {
        trailRef.current.unshift({ x: px, y: py });
        if (trailRef.current.length > TRAIL) trailRef.current.length = TRAIL;
      } else {
        trailRef.current.length = 0;
      }

      trailRef.current.forEach((pt, i) => {
        const frac = 1 - (i + 1) / TRAIL;
        const tR = Math.max(1.2, W * 0.0025) * frac;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, tR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ACCENT[0]},${ACCENT[1]},${ACCENT[2]},${(frac * 0.5).toFixed(3)})`;
        ctx.fill();
      });

      // ── Packet itself (skip during cycle wrap so it doesn't streak back) ─
      if (!wrapToStart) {
        const pR = Math.max(3.5, W * 0.0042);
        radialGlow(px, py, pR * 6, 0.7);
        ctx.beginPath();
        ctx.arc(px, py, pR, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(230, 246, 255, 1)";
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    function start() {
      cancelAnimationFrame(rafRef.current);
      if (reducedMotionRef.current) {
        drawStaticState();
        return;
      }
      t0Ref.current = -1;
      rafRef.current = requestAnimationFrame(frame);
    }

    function stop() {
      cancelAnimationFrame(rafRef.current);
    }

    resize();
    start();

    const ro = new ResizeObserver(() => {
      resize();
      if (reducedMotionRef.current) drawStaticState();
    });
    ro.observe(wrap);

    const io = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
        if (entry.isIntersecting) {
          start();
        } else {
          stop();
        }
      },
      { threshold: 0 },
    );
    io.observe(wrap);

    const mqlListener = (event: MediaQueryListEvent) => {
      reducedMotionRef.current = event.matches;
      if (event.matches) {
        stop();
        drawStaticState();
      } else if (visibleRef.current) {
        start();
      }
    };
    mql.addEventListener("change", mqlListener);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      io.disconnect();
      mql.removeEventListener("change", mqlListener);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden
      style={{ width: "100%", height: 280, maxHeight: 280 }}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}

export default PipelineOverview;
