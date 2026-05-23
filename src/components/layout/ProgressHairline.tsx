"use client";
import { motion, useScroll } from "framer-motion";

export function ProgressHairline() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed inset-x-0 bottom-0 z-30 h-px origin-left"
      style={{
        scaleX: scrollYProgress,
        background: "var(--color-accent-line)",
      }}
      aria-hidden
    />
  );
}
