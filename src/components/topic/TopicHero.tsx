"use client";
import { motion } from "framer-motion";
import { Topic, TOPIC_STEP_MAP } from "@/data/topics";
import { stepByNumber } from "@/lib/steps";
import { StepBadge } from "@/components/atoms/StepBadge";
import { OutputBadge } from "@/components/atoms/OutputBadge";
import { stagger, fadeUp, ease } from "@/lib/motion";

export default function TopicHero({ topic }: { topic: Topic }) {
  const stepInfo = TOPIC_STEP_MAP[topic.id];
  const step = stepInfo ? stepByNumber(stepInfo.step) : undefined;

  return (
    <motion.header initial="hidden" animate="visible" variants={stagger(0.08)}>
      {topic.outputs && (
        <motion.div variants={fadeUp} className="mb-3">
          <OutputBadge label={topic.outputs.label} type={topic.outputs.type} />
        </motion.div>
      )}
      <motion.div variants={fadeUp}>
        {step && (
          <StepBadge
            step={step.step}
            label={`${step.title} · ${step.arrow}`}
          />
        )}
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 12, letterSpacing: "-0.04em" }}
        animate={{ opacity: 1, y: 0, letterSpacing: "-0.018em" }}
        transition={{ duration: 0.7, ease: ease.out, delay: 0.1 }}
        style={{ fontSize: 'var(--type-title)' }}
        className="mt-4 font-[family-name:var(--font-display)] leading-[1.05] text-[color:var(--color-text-primary)]"
      >
        {topic.title}
      </motion.h1>
      {topic.subtitle && (
        <motion.p
          variants={fadeUp}
          style={{ fontSize: 'var(--type-lede)' }}
          className="mt-6 max-w-[58ch] leading-[1.55] text-[color:var(--color-text-secondary)]"
        >
          {topic.subtitle}
        </motion.p>
      )}
      {stepInfo && (
        <motion.div variants={fadeUp} className="mt-10 font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-text-dim)]">
          concept {String(stepInfo.globalOrder).padStart(2, "0")} of 28 · step {String(step?.step ?? 0).padStart(2, "0")}.{stepInfo.order}
        </motion.div>
      )}
    </motion.header>
  );
}
