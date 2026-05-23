import type { Variants } from "framer-motion";

export const ease = {
  out: [0.16, 1, 0.3, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  inBack: [0.5, -0.5, 0.5, 1.5] as const,
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: ease.out },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, ease: ease.out } },
};

export const stagger = (gap = 0.08): Variants => ({
  hidden: {},
  visible: { transition: { staggerChildren: gap } },
});

export const drawRule: Variants = {
  hidden: { scaleX: 0 },
  visible: {
    scaleX: 1,
    transition: { duration: 0.8, ease: ease.out },
  },
};

export const heroEntrance: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: ease.out, delay: 0.08 },
  },
};

export const demoReveal: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: ease.out, delay: 0.32 },
  },
};

export const railDotActive: Variants = {
  rest: { scale: 1, opacity: 0.85 },
  pulse: {
    opacity: [0.7, 1, 0.7],
    transition: { duration: 1.8, repeat: Infinity, ease: "linear" },
  },
};

export const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.24, ease: ease.out },
};
