"use client";

import { useEffect, useRef } from "react";

interface Props {
  step: number;
}

export function StepHero({ step }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const ro = new ResizeObserver(() => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    });
    ro.observe(canvas);

    const t0 = performance.now();
    const tick = (now: number) => {
      const t = (now - t0) / 1000;
      const rect = canvas.getBoundingClientRect();
      const W = rect.width;
      const H = rect.height;
      ctx.clearRect(0, 0, W, H);

      switch (step) {
        case 1:
          drawNetworkFlow(ctx, W, H, t);
          break;
        case 2:
          drawParsingWaves(ctx, W, H, t);
          break;
        case 3:
          drawTreeBuild(ctx, W, H, t);
          break;
        case 4:
          drawLayoutGrid(ctx, W, H, t);
          break;
        case 5:
          drawPaintStrokes(ctx, W, H, t);
          break;
        case 6:
          drawLayerStack(ctx, W, H, t);
          break;
        case 7:
          drawVSyncPulse(ctx, W, H, t);
          break;
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [step]);

  return (
    <div className="relative my-12 overflow-hidden rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
      <canvas ref={canvasRef} className="block h-[240px] w-full" />
    </div>
  );
}

// === Per-step draw functions — ice-cyan only, subtle, restrained ===

function drawNetworkFlow(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
) {
  // Horizontal "packets" streaming left-to-right at varied speeds.
  const numPackets = 8;
  for (let i = 0; i < numPackets; i++) {
    const speed = 30 + i * 5;
    const x = ((t * speed + i * 60) % (W + 100)) - 50;
    const y = H * (0.2 + (i % 4) * 0.18);
    const alpha = 0.15 + 0.4 * Math.sin(t * 0.8 + i);
    ctx.fillStyle = `rgba(125, 211, 252, ${Math.max(0.05, alpha)})`;
    ctx.beginPath();
    ctx.arc(x, y, 2 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(125, 211, 252, ${Math.max(0.05, alpha) * 0.3})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 30, y);
    ctx.lineTo(x, y);
    ctx.stroke();
  }
}

function drawParsingWaves(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
) {
  // Stacked sine waves — like tokens flowing through the parser.
  for (let layer = 0; layer < 4; layer++) {
    ctx.strokeStyle = `rgba(125, 211, 252, ${0.1 + layer * 0.06})`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 3) {
      const y =
        H / 2 +
        Math.sin(x / 40 + t + layer * 0.5) * (10 + layer * 4) +
        (layer - 1.5) * 8;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}

function drawTreeBuild(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
) {
  // Tree nodes growing in over 6s, then resetting.
  const nodes: Array<{ x: number; y: number; level: number; age: number }> = [];
  const buildPhase = (t % 6) / 6;
  for (let level = 0; level < 4; level++) {
    const count = 1 << level;
    for (let i = 0; i < count; i++) {
      const x = W * ((i + 0.5) / count);
      const y = 30 + (level * (H - 60)) / 3;
      const age = Math.max(0, Math.min(1, (buildPhase * 4 - level) * 2));
      nodes.push({ x, y, level, age });
    }
  }
  for (const n of nodes) {
    if (n.level > 0 && n.age > 0.1) {
      const parent = nodes.find(
        (p) =>
          p.level === n.level - 1 &&
          Math.abs(p.x - n.x) < W / Math.pow(2, n.level),
      );
      if (parent) {
        ctx.strokeStyle = `rgba(125, 211, 252, ${0.3 * n.age})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(parent.x, parent.y);
        ctx.lineTo(n.x, n.y);
        ctx.stroke();
      }
    }
  }
  for (const n of nodes) {
    if (n.age > 0) {
      ctx.fillStyle = `rgba(125, 211, 252, ${0.4 + 0.4 * n.age})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, 3 * Math.min(1, n.age), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawLayoutGrid(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
) {
  // Boxes sliding into their final layout positions.
  const cols = 6;
  const rows = 3;
  const cellW = W / (cols + 1);
  const cellH = (H - 40) / (rows + 1);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const targetX = (c + 0.5) * cellW + 30;
      const targetY = 20 + (r + 0.5) * cellH;
      const phase = (t * 0.5 + c * 0.15 + r * 0.25) % 4;
      const slide = Math.max(0, Math.min(1, phase));
      const x = targetX - (1 - slide) * 30;
      const alpha = 0.15 + 0.25 * slide;
      ctx.strokeStyle = `rgba(125, 211, 252, ${alpha})`;
      ctx.lineWidth = 1;
      const bw = 30;
      const bh = 18;
      ctx.strokeRect(x - bw / 2, targetY - bh / 2, bw, bh);
    }
  }
}

function drawPaintStrokes(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
) {
  // Diagonal strokes accumulating like paint commands.
  const numStrokes = 14;
  for (let i = 0; i < numStrokes; i++) {
    const phase = ((t * 0.4 + i * 0.3) % 3) / 3;
    if (phase < 0.05) continue;
    const startX = (i / numStrokes) * W + 30;
    const startY = H * 0.2;
    const len = phase * 90;
    const angle = Math.PI / 4;
    ctx.strokeStyle = `rgba(125, 211, 252, ${0.15 + 0.3 * (1 - phase)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + Math.cos(angle) * len, startY + Math.sin(angle) * len);
    ctx.stroke();
  }
}

function drawLayerStack(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
) {
  // Translucent layers stacking, shifting like compositor input.
  const numLayers = 5;
  for (let i = 0; i < numLayers; i++) {
    const offset = Math.sin(t * 0.3 + i * 0.7) * 4;
    const y = H / 2 - ((numLayers - 1) * 12) / 2 + i * 12 + offset;
    const x1 = W * 0.3 + Math.sin(t * 0.2 + i) * 8;
    const x2 = W * 0.7 + Math.cos(t * 0.25 + i) * 8;
    ctx.fillStyle = `rgba(125, 211, 252, ${0.06 + i * 0.04})`;
    ctx.strokeStyle = `rgba(125, 211, 252, ${0.25 + i * 0.05})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(x1, y - 6, x2 - x1, 14);
    ctx.fill();
    ctx.stroke();
  }
}

function drawVSyncPulse(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  t: number,
) {
  // VSync bars — a heartbeat sweeping across.
  const numBars = 16;
  const barW = (W - 30) / numBars - 4;
  const cycle = (t * 1.5) % numBars;
  for (let i = 0; i < numBars; i++) {
    const dist = Math.abs(i - cycle);
    const intensity = Math.max(0, 1 - dist / 2);
    const h = 12 + 60 * intensity;
    const x = 15 + i * (barW + 4);
    const y = H / 2 - h / 2;
    ctx.fillStyle = `rgba(125, 211, 252, ${0.15 + intensity * 0.4})`;
    ctx.fillRect(x, y, barW, h);
  }
}
