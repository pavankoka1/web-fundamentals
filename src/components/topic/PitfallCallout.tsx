"use client";
import { motion } from "framer-motion";
import { stagger, fadeUp } from "@/lib/motion";

interface Props {
  pitfalls: string[];
}

export function PitfallCallout({ pitfalls }: Props) {
  if (!pitfalls.length) return null;
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={stagger(0.08)}
      className="my-12 rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)]/40 p-6 lg:p-8"
    >
      <motion.div variants={fadeUp} className="mb-4 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-accent)]">
        <span className="inline-block h-1 w-1 rounded-full bg-[color:var(--color-accent)]" />
        Watch for
      </motion.div>
      <ul className="space-y-3.5">
        {pitfalls.map((p, i) => (
          <motion.li key={i} variants={fadeUp} className="flex items-baseline gap-3 text-[14px] leading-[1.55] text-[color:var(--color-text-secondary)]">
            <span aria-hidden className="font-mono text-[10px] uppercase tracking-[0.16em] text-[color:var(--color-text-dim)] mt-[3px] min-w-[1rem]">{String(i + 1).padStart(2, '0')}</span>
            <span>{p}</span>
          </motion.li>
        ))}
      </ul>
    </motion.section>
  );
}
