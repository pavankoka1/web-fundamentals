"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export function HomeMark() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <Link
      href="/"
      aria-label="Home — web-internals tutorial"
      className="fixed left-6 top-6 z-40 block"
    >
      <motion.div
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        whileHover={prefersReducedMotion ? undefined : { x: -2 }}
        className="group flex items-center gap-2.5 rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/60 px-3 py-1.5 backdrop-blur-sm transition-colors hover:border-[color:var(--color-accent-line)] hover:bg-[color:var(--color-accent-soft)]"
      >
        {/* Compact home glyph — abstract WI mark in ice cyan */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
        >
          <path
            d="M 2 11 L 2 5 L 7 1.5 L 12 5 L 12 11 Z"
            stroke="var(--color-accent)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M 5.5 11 L 5.5 7.5 L 8.5 7.5 L 8.5 11"
            stroke="var(--color-accent)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.85"
          />
        </svg>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-text-secondary)] transition-colors group-hover:text-[color:var(--color-accent)]">
          home
        </span>
      </motion.div>
    </Link>
  );
}
