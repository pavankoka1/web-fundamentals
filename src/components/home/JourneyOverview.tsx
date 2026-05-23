"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { STEPS } from "@/lib/steps";
import { GradientRule } from "@/components/atoms/GradientRule";
import { stagger, fadeUp, heroEntrance } from "@/lib/motion";

export function JourneyOverview() {
  return (
    <main className="mx-auto max-w-[840px] px-8 pt-32 pb-24 lg:pl-24">
      <motion.div initial="hidden" animate="visible" variants={stagger(0.08)}>
        <motion.div variants={fadeUp} className="font-mono text-[var(--type-eyebrow)] uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
          web-internals · tutorial
        </motion.div>
        <motion.h1
          variants={heroEntrance}
          className="mt-3 font-[family-name:var(--font-display)] text-[var(--type-hero)] leading-[1.05] tracking-[-0.018em] text-[color:var(--color-text-primary)]"
        >
          From URL to pixels.<br/>In seven steps.
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-[58ch] text-[var(--type-lede)] leading-[1.55] text-[color:var(--color-text-secondary)]"
        >
          The browser&apos;s journey, beginning when you press Enter and ending when pixels appear on the screen. Each step builds on the last — start anywhere, but the story works best in order.
        </motion.p>

        <div className="mt-12"><GradientRule /></div>

        <motion.div className="mt-8" variants={stagger(0.06)}>
          {STEPS.map((s) => (
            <motion.div key={s.step} variants={fadeUp}>
              <Link
                href={`/steps/${s.slug}`}
                className="group block border-b border-[color:var(--color-border)] py-6 transition-colors hover:bg-[color:var(--color-accent-soft)]"
              >
                <div className="flex items-baseline gap-6">
                  <span className="min-w-[2.5rem] font-mono text-[var(--type-eyebrow)] uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
                    {String(s.step).padStart(2, "0")}
                  </span>
                  <div className="flex-1">
                    <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
                      {s.arrow}
                    </div>
                    <h2 className="mt-1 font-[family-name:var(--font-display)] text-[22px] leading-tight text-[color:var(--color-text-primary)]">
                      {s.title}
                    </h2>
                    <p className="mt-2 max-w-[58ch] text-[14px] leading-relaxed text-[color:var(--color-text-secondary)]">
                      {s.lede}
                    </p>
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] transition-colors group-hover:text-[color:var(--color-accent)]">
                    begin →
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </main>
  );
}
