"use client";

import { useEffect, useRef } from "react";

/**
 * BackgroundFX v2 — a "living network" ambient canvas.
 *
 * Three layers, one canvas, one rAF loop:
 *   1. Flow-field particles with fading trails — drift along a slowly rotating
 *      pseudo-noise field, leaving brief decaying tails. Looks like air
 *      currents / magnetic lines.
 *   2. Pulse network — a jittered grid of ~20 nodes connected by faint dotted
 *      edges. Periodically a bright ice-cyan pulse rides an edge from one
 *      node to another; arrival triggers a glow + expanding ring.
 *   3. Cursor halo — a subtle radial gradient at the mouse position, plus a
 *      gentle gravitational pull on nearby particles. Creates presence.
 *
 * Performance:
 *   - DPR-aware sizing via ResizeObserver.
 *   - Page Visibility API pauses the loop when document.hidden.
 *   - prefers-reduced-motion → static snapshot (nodes + edges, no motion).
 *   - All math in O(N) per frame; N kept moderate (≤ 90 particles, ≤ 24 nodes).
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: { x: number; y: number }[];
  brightness: number; // 0..1, boosted by cursor proximity
  baseAlpha: number;
}

interface Node {
  x: number;
  y: number;
  glow: number; // 0..1, decays toward 0
  ring: number; // 0..1, expanding ring radius lerp
  ringActive: boolean;
  connections: number[];
}

interface Pulse {
  fromNode: number;
  toNode: number;
  t: number; // 0..1 progress along edge
  speed: number;
}

const ACCENT: [number, number, number] = [125, 211, 252];
const PARTICLE_COUNT = 90;
const NODE_TARGET = 20;
const TRAIL_LEN = 10;
const CONNECT_DIST = 280;
const CURSOR_RADIUS = 200;

// Compact pseudo-noise — not true Perlin but smooth enough for ambient flow.
function noise2D(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const hash = (a: number, b: number) => {
    const h = (a * 374761393 + b * 668265263) | 0;
    return (((h ^ (h >>> 13)) * 1274126177) | 0) / 0x7fffffff;
  };
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const aa = hash(xi, yi);
  const ba = hash(xi + 1, yi);
  const ab = hash(xi, yi + 1);
  const bb = hash(xi + 1, yi + 1);
  return (
    aa * (1 - u) * (1 - v) +
    ba * u * (1 - v) +
    ab * (1 - u) * v +
    bb * u * v
  );
}

function flowAngle(x: number, y: number, t: number): number {
  // Map noise [~-1..1] → angle, with slow temporal rotation.
  return noise2D(x * 0.0035, y * 0.0035) * Math.PI * 4 + t * 0.0006;
}

export function BackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  const particlesRef = useRef<Particle[]>([]);
  const nodesRef = useRef<Node[]>([]);
  const pulsesRef = useRef<Pulse[]>([]);

  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  });
  const nextPulseAtRef = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // ---- sizing ----------------------------------------------------------
    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.floor(W * dpr);
      canvas.height = Math.floor(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // ---- node graph generation ------------------------------------------
    function buildNodes() {
      // Bias an offset grid with noise jitter so it doesn't read as a
      // chessboard. Aim for NODE_TARGET (20) nodes scaled to viewport area.
      const area = W * H;
      const target = Math.max(
        12,
        Math.min(24, Math.round((NODE_TARGET * area) / (1440 * 900)))
      );
      const cols = Math.max(3, Math.round(Math.sqrt((target * W) / H)));
      const rows = Math.max(3, Math.ceil(target / cols));
      const cellW = W / cols;
      const cellH = H / rows;

      const nodes: Node[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          // Stagger odd rows for less grid-like feel
          const stagger = r % 2 === 0 ? 0 : cellW * 0.5;
          const jx = (noise2D(c * 0.7, r * 1.3) - 0.5) * cellW * 0.6;
          const jy = (noise2D(c * 1.7, r * 0.9) - 0.5) * cellH * 0.6;
          const x = c * cellW + cellW / 2 + stagger + jx;
          const y = r * cellH + cellH / 2 + jy;
          if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
          nodes.push({
            x,
            y,
            glow: 0,
            ring: 0,
            ringActive: false,
            connections: [],
          });
        }
      }

      // Build connections within CONNECT_DIST.
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          if (dx * dx + dy * dy < CONNECT_DIST * CONNECT_DIST) {
            nodes[i].connections.push(j);
            nodes[j].connections.push(i);
          }
        }
      }
      nodesRef.current = nodes;
    }

    // ---- particles -------------------------------------------------------
    function spawnParticles() {
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: 0,
        vy: 0,
        trail: [],
        brightness: 0,
        baseAlpha: Math.random() * 0.06 + 0.04, // 0.04..0.10
      }));
    }

    // ---- pulses ----------------------------------------------------------
    function spawnPulse() {
      const nodes = nodesRef.current;
      if (nodes.length === 0) return;
      // Pick a random node that has connections.
      const candidates: number[] = [];
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].connections.length > 0) candidates.push(i);
      }
      if (candidates.length === 0) return;
      const from = candidates[Math.floor(Math.random() * candidates.length)];
      const conns = nodes[from].connections;
      const to = conns[Math.floor(Math.random() * conns.length)];
      pulsesRef.current.push({
        fromNode: from,
        toNode: to,
        t: 0,
        speed: 0.006 + Math.random() * 0.008, // ~1.2-2s end-to-end
      });
    }

    // ---- static fallback -------------------------------------------------
    function drawStatic() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const nodes = nodesRef.current;
      // edges
      ctx.lineWidth = 0.6;
      ctx.setLineDash([2, 4]);
      for (const n of nodes) {
        for (const j of n.connections) {
          const m = nodes[j];
          if (j < nodes.indexOf(n)) continue;
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const a = (1 - d / CONNECT_DIST) * 0.09;
          ctx.strokeStyle = `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, ${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);
      // nodes
      for (const n of nodes) {
        ctx.fillStyle = `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, 0.18)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ---- frame -----------------------------------------------------------
    function frame() {
      if (!ctx) return;
      frameRef.current += 1;
      const t = frameRef.current;
      ctx.clearRect(0, 0, W, H);

      // Layer 3 (drawn first as a soft wash under everything else):
      // cursor halo — radial gradient at mouse.
      const m = mouseRef.current;
      if (m.active) {
        const grad = ctx.createRadialGradient(
          m.x,
          m.y,
          0,
          m.x,
          m.y,
          CURSOR_RADIUS
        );
        grad.addColorStop(0, `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, 0.07)`);
        grad.addColorStop(1, `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(m.x, m.y, CURSOR_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      // Layer 1: flow-field particles + trails.
      const ps = particlesRef.current;
      for (const p of ps) {
        const angle = flowAngle(p.x, p.y, t);
        const speed = 0.35;
        let ax = Math.cos(angle) * speed;
        let ay = Math.sin(angle) * speed;

        // Cursor pull — subtle gravitation toward mouse + brightness boost.
        p.brightness *= 0.92;
        if (m.active) {
          const dx = m.x - p.x;
          const dy = m.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < CURSOR_RADIUS * CURSOR_RADIUS) {
            const d = Math.sqrt(d2) || 1;
            const pull = (1 - d / CURSOR_RADIUS) * 0.18;
            ax += (dx / d) * pull;
            ay += (dy / d) * pull;
            p.brightness = Math.min(1, p.brightness + 0.08 * (1 - d / CURSOR_RADIUS));
          }
        }

        // Inertia-blend so trails curve smoothly.
        p.vx = p.vx * 0.85 + ax * 0.15;
        p.vy = p.vy * 0.85 + ay * 0.15;
        p.x += p.vx;
        p.y += p.vy;

        // Trail bookkeeping.
        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > TRAIL_LEN) p.trail.shift();

        // Wrap with trail reset to avoid teleporting line artifacts.
        if (p.x < -10 || p.x > W + 10 || p.y < -10 || p.y > H + 10) {
          p.x = Math.random() * W;
          p.y = Math.random() * H;
          p.vx = 0;
          p.vy = 0;
          p.trail.length = 0;
        }

        // Draw trail as a polyline with per-segment alpha falloff.
        if (p.trail.length > 1) {
          for (let i = 1; i < p.trail.length; i++) {
            const a = p.trail[i - 1];
            const b = p.trail[i];
            const segAlpha =
              (i / p.trail.length) * p.baseAlpha * (1 + p.brightness * 1.2);
            ctx.strokeStyle = `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, ${segAlpha.toFixed(3)})`;
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        // Head dot — slightly brighter, indicates current position.
        const headAlpha =
          Math.min(0.12, p.baseAlpha * 1.4) + p.brightness * 0.08;
        ctx.fillStyle = `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, ${headAlpha.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Layer 2: pulse network.
      const nodes = nodesRef.current;

      // Edges — dotted, low alpha, alpha scales with distance.
      ctx.setLineDash([2, 5]);
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        for (const j of n.connections) {
          if (j <= i) continue;
          const o = nodes[j];
          const dx = n.x - o.x;
          const dy = n.y - o.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          const a = (1 - d / CONNECT_DIST) * 0.08;
          ctx.strokeStyle = `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, ${a.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(o.x, o.y);
          ctx.stroke();
        }
      }
      ctx.setLineDash([]);

      // Nodes — base dot + decaying glow + expanding arrival ring.
      for (const n of nodes) {
        // base dot
        const baseA = 0.15 + n.glow * 0.5;
        ctx.fillStyle = `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, ${baseA.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.6 + n.glow * 1.4, 0, Math.PI * 2);
        ctx.fill();

        // soft outer glow when active
        if (n.glow > 0.02) {
          const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, 22);
          g.addColorStop(0, `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, ${(n.glow * 0.18).toFixed(3)})`);
          g.addColorStop(1, `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, 0)`);
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
          ctx.fill();
        }

        // expanding ring on arrival
        if (n.ringActive) {
          const r = n.ring * 28;
          const ringA = (1 - n.ring) * 0.4;
          ctx.strokeStyle = `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, ${ringA.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
          ctx.stroke();
          n.ring += 0.035;
          if (n.ring >= 1) {
            n.ring = 0;
            n.ringActive = false;
          }
        }

        // glow decay
        n.glow *= 0.94;
      }

      // Pulses — traveling dots along edges.
      const pulses = pulsesRef.current;
      for (let i = pulses.length - 1; i >= 0; i--) {
        const pl = pulses[i];
        const from = nodes[pl.fromNode];
        const to = nodes[pl.toNode];
        if (!from || !to) {
          pulses.splice(i, 1);
          continue;
        }
        pl.t += pl.speed;
        const tt = Math.min(1, pl.t);
        const px = from.x + (to.x - from.x) * tt;
        const py = from.y + (to.y - from.y) * tt;

        // ice-cyan dot with halo
        const glow = ctx.createRadialGradient(px, py, 0, px, py, 9);
        glow.addColorStop(0, `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, 0.55)`);
        glow.addColorStop(1, `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, 0)`);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, 0.55)`;
        ctx.beginPath();
        ctx.arc(px, py, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Arrival → trigger destination glow + ring, then remove pulse.
        if (pl.t >= 1) {
          to.glow = 1;
          to.ring = 0;
          to.ringActive = true;
          pulses.splice(i, 1);
        }
      }

      // Spawn cadence — every 1.5-3s (assuming ~60fps, 90-180 frames).
      if (t >= nextPulseAtRef.current) {
        spawnPulse();
        nextPulseAtRef.current = t + 90 + Math.floor(Math.random() * 90);
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    // ---- lifecycle -------------------------------------------------------
    function start() {
      cancelAnimationFrame(rafRef.current);
      if (prefersReduced) {
        drawStatic();
        return;
      }
      rafRef.current = requestAnimationFrame(frame);
    }

    function stop() {
      cancelAnimationFrame(rafRef.current);
    }

    function onResize() {
      resize();
      buildNodes();
      spawnParticles();
      pulsesRef.current = [];
      nextPulseAtRef.current = frameRef.current + 60;
      if (prefersReduced) drawStatic();
    }

    function onMouseMove(e: MouseEvent) {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    }

    function onMouseLeave() {
      mouseRef.current.active = false;
    }

    function onVisibilityChange() {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    }

    // boot
    resize();
    buildNodes();
    spawnParticles();
    nextPulseAtRef.current = 60;
    start();

    const ro = new ResizeObserver(onResize);
    ro.observe(document.documentElement);
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      ro.disconnect();
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      aria-hidden
    />
  );
}

export default BackgroundFX;
