"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  alpha: number;
  twinkle: number;
}

const PARTICLE_COUNT = 60;
const CONNECT_DISTANCE = 140;
const ACCENT: [number, number, number] = [125, 211, 252];

/**
 * BackgroundFX — global ambient canvas: drifting ice-cyan particles,
 * occasional constellation lines, a slow vertical light sweep, and a subtle
 * scroll-velocity boost. Sits behind all content (z-0, pointer-events-none),
 * pauses when the tab is hidden, and falls back to a static dotted grid
 * under prefers-reduced-motion.
 */
export function BackgroundFX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const lastScrollY = useRef(0);
  const scrollBoost = useRef(0);
  const sweepRef = useRef({ y: -50, t: 0 });

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

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = window.devicePixelRatio || 1;
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function spawn() {
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.12,
        vy: (Math.random() - 0.5) * 0.1 - 0.02,
        r: Math.random() * 1.3 + 0.4,
        alpha: Math.random() * 0.18 + 0.04,
        twinkle: Math.random() * Math.PI * 2,
      }));
    }

    function drawStatic() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      const step = 50;
      for (let y = step / 2; y < H; y += step) {
        for (let x = step / 2; x < W; x += step) {
          ctx.fillStyle = `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, 0.06)`;
          ctx.beginPath();
          ctx.arc(x, y, 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    function frame() {
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);

      // Decay scroll boost
      scrollBoost.current *= 0.92;

      // Sweep line — slow vertical drift bottom-to-top (~20s)
      sweepRef.current.t += 1;
      if (sweepRef.current.y > H + 50 || sweepRef.current.t > 1200) {
        sweepRef.current.y = -50;
        sweepRef.current.t = 0;
      }
      sweepRef.current.y += 0.4;
      const sy = sweepRef.current.y;
      const sweepGrad = ctx.createLinearGradient(0, sy - 80, 0, sy + 80);
      sweepGrad.addColorStop(0, "rgba(125, 211, 252, 0)");
      sweepGrad.addColorStop(0.5, "rgba(125, 211, 252, 0.03)");
      sweepGrad.addColorStop(1, "rgba(125, 211, 252, 0)");
      ctx.fillStyle = sweepGrad;
      ctx.fillRect(0, sy - 80, W, 160);

      // Update + draw particles
      const ps = particlesRef.current;
      for (const p of ps) {
        const boost = 1 + scrollBoost.current;
        p.x += p.vx * boost;
        p.y += p.vy * boost;
        p.twinkle += 0.02;

        // Wrap
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
        if (p.y < -10) p.y = H + 10;
        if (p.y > H + 10) p.y = -10;

        const flicker = 0.7 + 0.3 * Math.sin(p.twinkle);
        ctx.fillStyle = `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, ${(
          p.alpha * flicker
        ).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connection lines between nearby particles — constellation effect
      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const a = ps[i];
          const b = ps[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < CONNECT_DISTANCE * CONNECT_DISTANCE) {
            const d = Math.sqrt(d2);
            const alpha = (1 - d / CONNECT_DISTANCE) * 0.1;
            ctx.strokeStyle = `rgba(${ACCENT[0]}, ${ACCENT[1]}, ${ACCENT[2]}, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(frame);
    }

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

    function onScroll() {
      const y = window.scrollY;
      const dy = Math.abs(y - lastScrollY.current);
      scrollBoost.current = Math.min(2, scrollBoost.current + dy * 0.003);
      lastScrollY.current = y;
    }

    function onResize() {
      resize();
      spawn();
    }

    function onVisibilityChange() {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    }

    resize();
    spawn();
    start();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      stop();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
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
