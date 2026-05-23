"use client";
import { motion } from "framer-motion";
import { drawRule } from "@/lib/motion";

export function GradientRule({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`relative h-px w-full ${className}`}
      style={{ transformOrigin: "left" }}
      variants={drawRule}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, var(--color-accent-line) 0%, rgba(125,211,252,0.05) 32%, transparent 65%)",
        }}
      />
    </motion.div>
  );
}
