"use client";
import { motion } from "framer-motion";
import { StepMeta } from "@/lib/steps";
import { StepBadge } from "@/components/atoms/StepBadge";
import { GradientRule } from "@/components/atoms/GradientRule";
import { ConceptCard } from "@/components/atoms/ConceptCard";
import { stagger, fadeUp, heroEntrance } from "@/lib/motion";
import { Topic, TOPIC_STEP_MAP } from "@/data/topics";

interface Props {
  step: StepMeta;
  concepts: Topic[];
}

export function StepLanding({ step, concepts }: Props) {
  return (
    <main className="mx-auto max-w-[840px] px-8 pt-32 pb-24 lg:pl-24">
      <motion.div initial="hidden" animate="visible" variants={stagger(0.08)}>
        <motion.div variants={fadeUp}>
          <StepBadge step={step.step} label={step.arrow} />
        </motion.div>
        <motion.h1
          variants={heroEntrance}
          className="mt-4 font-[family-name:var(--font-display)] text-[var(--type-title)] leading-[1.05] tracking-[-0.018em] text-[color:var(--color-text-primary)]"
        >
          {step.title}
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-6 max-w-[58ch] text-[var(--type-lede)] leading-[1.55] text-[color:var(--color-text-secondary)]"
        >
          {step.lede}
        </motion.p>

        <div className="mt-12">
          <GradientRule />
        </div>

        <motion.div
          className="mt-8 font-mono text-[var(--type-label)] uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]"
          variants={fadeUp}
        >
          Concepts in this step
        </motion.div>

        <motion.div className="mt-4" variants={stagger(0.06)}>
          {concepts.map((c) => {
            const m = TOPIC_STEP_MAP[c.id];
            return (
              <ConceptCard
                key={c.id}
                href={`/steps/${step.slug}/${c.id}`}
                step={step.step}
                index={m?.order ?? 0}
                globalOrder={m?.globalOrder ?? 0}
                title={c.title}
                hook={c.hook || c.subtitle || ""}
                isNew={c.newConcept}
              />
            );
          })}
        </motion.div>
      </motion.div>
    </main>
  );
}
