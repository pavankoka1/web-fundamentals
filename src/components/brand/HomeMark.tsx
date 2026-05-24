"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

/**
 * HomeMark — refined animated KOKA monogram glyph.
 * No literal house icon, no "HOME" label. A 32×32 ice-cyan circle holds a
 * minimal "K" mark (three strokes). On hover, a subtle dashed ring rotates
 * slowly around the circle and the interior fills with the accent-soft tint.
 * Clicking still navigates to `/`.
 */
export function HomeMark() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Link
      href="/"
      title="home"
      aria-label="Home"
      className="fixed left-6 top-6 z-40 block"
    >
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.06 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.96 }}
        className="group relative grid h-8 w-8 place-items-center"
      >
        {/* Hover glow halo */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            boxShadow: "0 0 18px var(--color-accent-glow)",
          }}
        />

        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
          className="block"
        >
          {/* Soft background fill — appears on hover */}
          <circle
            cx="16"
            cy="16"
            r="14.5"
            fill="var(--color-accent-soft)"
            className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          />

          {/* Rotating dashed ring (hover only, paused under reduced motion) */}
          <motion.circle
            cx="16"
            cy="16"
            r="15"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="0.6"
            strokeDasharray="2 4"
            className="opacity-0 transition-opacity duration-300 group-hover:opacity-70"
            animate={prefersReducedMotion ? { rotate: 0 } : { rotate: 360 }}
            transition={
              prefersReducedMotion
                ? undefined
                : { duration: 4, ease: "linear", repeat: Infinity }
            }
            style={{ transformOrigin: "16px 16px" }}
          />

          {/* Primary circle */}
          <circle
            cx="16"
            cy="16"
            r="14.5"
            fill="none"
            stroke="rgba(125, 211, 252, 0.5)"
            strokeWidth="1.4"
            className="transition-[stroke] duration-300 group-hover:[stroke:var(--color-accent)]"
          />

          {/* K monogram — three minimal strokes meeting at the centre */}
          <g
            stroke="rgba(125, 211, 252, 0.55)"
            strokeWidth="1.4"
            strokeLinecap="round"
            className="transition-[stroke] duration-300 group-hover:[stroke:var(--color-accent)]"
          >
            {/* Vertical spine */}
            <line x1="11.5" y1="9.5" x2="11.5" y2="22.5" />
            {/* Upper diagonal */}
            <line x1="11.5" y1="16" x2="20" y2="9.5" />
            {/* Lower diagonal */}
            <line x1="11.5" y1="16" x2="20" y2="22.5" />
          </g>
        </svg>
      </motion.div>
    </Link>
  );
}
