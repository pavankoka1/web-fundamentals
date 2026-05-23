"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export function KokaMark() {
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  const width = useTransform(scrollY, [0, 64], [144, 72]);
  const height = useTransform(scrollY, [0, 64], [48, 24]);
  const opacity = useTransform(scrollY, [0, 64], [1, 0.85]);

  const pathVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: (i: number) => ({
      pathLength: prefersReducedMotion ? 1 : [0, 1, 1, 0],
      opacity: prefersReducedMotion ? 0.85 : [0, 1, 1, 0],
      transition: {
        duration: prefersReducedMotion ? 0 : 4,
        ease: [0.65, 0, 0.35, 1] as const,
        delay: i * 0.1,
        times: [0, 0.375, 0.625, 1],
        repeat: prefersReducedMotion ? 0 : Infinity,
        repeatDelay: 0.5,
      },
    }),
  };

  return (
    <motion.div
      className="pointer-events-none fixed top-6 z-40"
      style={{
        left: "50%",
        x: "-50%",
        width,
        height,
        opacity,
      }}
      aria-hidden
    >
      <motion.svg
        width="100%"
        height="100%"
        viewBox="0 0 120 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        initial="hidden"
        animate="visible"
        style={{
          filter: "drop-shadow(0 0 12px var(--color-accent-glow))",
        }}
      >
        <defs>
          <linearGradient id="koka-mark-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <motion.path d="M 18 5 L 18.001 35" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={0} variants={pathVariants} />
        <motion.path d="M18 20 L31 5" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={1} variants={pathVariants} />
        <motion.path d="M18 20 L31 35" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={2} variants={pathVariants} />
        <motion.path d="M37 20 C37 12.268 43.268 6 51 6 C58.732 6 65 12.268 65 20 C65 27.732 58.732 34 51 34 C43.268 34 37 27.732 37 20 Z" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={3} variants={pathVariants} />
        <motion.path d="M 75 5 L 75.001 35" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={4} variants={pathVariants} />
        <motion.path d="M75 20 L88 5" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={5} variants={pathVariants} />
        <motion.path d="M75 20 L88 35" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={6} variants={pathVariants} />
        <motion.path d="M95 35 L105 5" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={7} variants={pathVariants} />
        <motion.path d="M105 5 L115 35" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={8} variants={pathVariants} />
        <motion.path d="M98 25 L112 25" stroke="url(#koka-mark-gradient)" strokeWidth="1.4" strokeLinecap="round" custom={9} variants={pathVariants} />
      </motion.svg>
    </motion.div>
  );
}
