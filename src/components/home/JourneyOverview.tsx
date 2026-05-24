"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { STEPS } from "@/lib/steps";
import { GradientRule } from "@/components/atoms/GradientRule";
import { stagger, fadeUp, heroEntrance } from "@/lib/motion";
import { PipelineOverview } from "./PipelineOverview";

export function JourneyOverview() {
  return (
    <main className="relative z-10 mx-auto max-w-[840px] px-8 pt-32 pb-24 lg:pl-24">
      <motion.div initial="hidden" animate="visible" variants={stagger(0.08)}>
        <motion.div variants={fadeUp} style={{ fontSize: 'var(--type-eyebrow)' }} className="font-mono uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
          web-internals · tutorial
        </motion.div>
        <motion.h1
          variants={heroEntrance}
          style={{ fontSize: 'var(--type-hero)' }}
          className="mt-3 font-[family-name:var(--font-display)] leading-[1.05] tracking-[-0.018em] text-[color:var(--color-text-primary)]"
        >
          From URL to pixels.<br/>In seven steps.
        </motion.h1>
        <motion.p
          variants={fadeUp}
          style={{ fontSize: 'var(--type-lede)' }}
          className="mt-6 max-w-[58ch] leading-[1.55] text-[color:var(--color-text-secondary)]"
        >
          The browser&apos;s journey, beginning when you press Enter and ending when pixels appear on the screen. Each step builds on the last — start anywhere, but the story works best in order.
        </motion.p>

        <div className="mt-12"><GradientRule /></div>

        <motion.div variants={fadeUp} className="mt-12">
          <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
            The journey in one picture
          </div>
          <div className="relative overflow-hidden rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-surface)]">
            <PipelineOverview />
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-8">
          <GradientRule />
        </motion.div>

        <motion.div
          className="mt-8 font-mono text-[10px] uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]"
          variants={fadeUp}
        >
          Each step in detail
        </motion.div>

        <motion.div className="mt-6 flex flex-col gap-2" variants={stagger(0.06)}>
          {STEPS.map((s) => (
            <motion.div
              key={s.step}
              variants={fadeUp}
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300, damping: 24 }}
            >
              <Link
                href={`/steps/${s.slug}`}
                className="group block rounded-md border border-[color:var(--color-border)] bg-transparent px-6 py-6 transition-all duration-200 hover:border-[color:var(--color-accent-line)] hover:bg-[color:var(--color-accent-soft)] hover:shadow-[0_0_24px_-8px_var(--color-accent-glow)] lg:px-8"
              >
                <div className="flex items-baseline gap-6">
                  <span style={{ fontSize: 'var(--type-eyebrow)' }} className="min-w-[2.5rem] font-mono font-medium uppercase tracking-[0.22em] text-[color:var(--color-accent)]">
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
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)] opacity-60 transition-all duration-200 group-hover:opacity-100 group-hover:text-[color:var(--color-accent)] group-hover:translate-x-0.5">
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
