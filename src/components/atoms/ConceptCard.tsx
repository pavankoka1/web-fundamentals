"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export interface ConceptCardProps {
  href: string;
  step: number;
  index: number; // position within step
  globalOrder: number;
  title: string;
  hook: string;
  isNew?: boolean;
}

export function ConceptCard({ href, step, index, globalOrder, title, hook, isNew }: ConceptCardProps) {
  return (
    <motion.div variants={fadeUp} whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 24 }}>
      <Link
        href={href}
        className="group block rounded-md border border-[color:var(--color-border)] bg-transparent px-6 py-6 transition-all duration-200 hover:border-[color:var(--color-accent-line)] hover:bg-[color:var(--color-accent-soft)] hover:shadow-[0_0_24px_-8px_var(--color-accent-glow)] lg:px-8"
      >
        <div className="flex items-baseline gap-6">
          <span className="min-w-[3.5rem] font-mono text-[12px] font-medium uppercase tracking-[0.22em] text-[color:var(--color-text-dim)] transition-colors group-hover:text-[color:var(--color-accent)]">
            {String(step).padStart(2, "0")}.{index}
          </span>
          <div className="flex-1">
            <h3 className="font-[family-name:var(--font-display)] text-[19px] leading-tight text-[color:var(--color-text-primary)]">
              {title}
              {isNew && (
                <span className="ml-3 font-mono text-[9px] uppercase tracking-[0.18em] text-[color:var(--color-accent)]">
                  new
                </span>
              )}
            </h3>
            <p className="mt-2 max-w-[58ch] text-[13.5px] leading-relaxed text-[color:var(--color-text-secondary)]">
              {hook}
            </p>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-hover:text-[color:var(--color-accent)]">
            #{String(globalOrder).padStart(2, "0")}
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
