"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { STEPS, stepBySlug } from "@/lib/steps";
import { getTopicsByStep, TOPIC_STEP_MAP } from "@/data/topics";
import { useProgress } from "@/hooks/useProgress";
import { ease, fadeUp, stagger } from "@/lib/motion";

const TOTAL_CONCEPTS = 28;

export function SectionRail() {
  const pathname = usePathname();
  const { visited } = useProgress();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { stepSlug, conceptId } = parsePath(pathname);
  const stepMeta = stepSlug ? stepBySlug(stepSlug) : undefined;
  const stepConcepts = stepMeta ? getTopicsByStep(stepMeta.step) : [];

  const stepVisited = stepConcepts.filter((c) => visited.has(c.id)).length;
  const totalVisited = visited.size;
  const sectionPct = stepConcepts.length ? stepVisited / stepConcepts.length : 0;
  const journeyPct = Math.min(totalVisited / TOTAL_CONCEPTS, 1);

  const isHome = pathname === "/";

  if (!mounted) return null;

  return (
    <motion.nav
      aria-label="Section progress and concepts in this step"
      className="fixed right-6 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
      style={{ width: 180 }}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: ease.out }}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={stagger(0.08)}
        className="flex flex-col"
      >
        {/* Progress rings */}
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center gap-3 pb-5"
          style={{ borderBottom: "1px solid var(--color-border)" }}
        >
          <ProgressRings
            sectionPct={stepMeta ? sectionPct : journeyPct}
            journeyPct={journeyPct}
            stepNum={stepMeta?.step}
            hasSection={Boolean(stepMeta)}
          />
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-[color:var(--color-text-dim)]">
            {stepMeta ? (
              <>
                <span>
                  <span className="text-[color:var(--color-text-muted)]">Step </span>
                  {Math.round(sectionPct * 100)}%
                </span>
                <span aria-hidden>·</span>
                <span>
                  <span className="text-[color:var(--color-text-muted)]">All </span>
                  {Math.round(journeyPct * 100)}%
                </span>
              </>
            ) : (
              <span>
                <span className="text-[color:var(--color-text-muted)]">Journey </span>
                {Math.round(journeyPct * 100)}%
              </span>
            )}
          </div>
        </motion.div>

        {/* Concepts in the current step */}
        {stepMeta && stepConcepts.length > 0 && (
          <motion.div variants={fadeUp} className="mt-5">
            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
              In this step
            </div>
            <AnimatePresence mode="wait">
              <motion.ol
                key={stepMeta.slug}
                className="flex flex-col gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: ease.out }}
              >
                {stepConcepts.map((c, idx) => {
                  const meta = TOPIC_STEP_MAP[c.id];
                  const isVisited = visited.has(c.id);
                  const isActive = c.id === conceptId;
                  const orderNum = meta?.order ?? idx + 1;
                  return (
                    <motion.li
                      key={c.id}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: ease.out,
                        delay: 0.05 * idx,
                      }}
                    >
                      <Link
                        href={`/steps/${stepMeta.slug}/${c.id}`}
                        aria-current={isActive ? "page" : undefined}
                        className="group flex items-center gap-2"
                      >
                        <motion.span
                          aria-hidden
                          className="block h-1.5 w-1.5 shrink-0 rounded-full border"
                          style={{
                            borderColor: isActive
                              ? "var(--color-accent)"
                              : isVisited
                                ? "var(--color-text-muted)"
                                : "var(--color-text-dim)",
                            background:
                              isActive || isVisited
                                ? "var(--color-accent)"
                                : "transparent",
                          }}
                          animate={
                            isActive
                              ? { scale: [1, 1.2, 1] }
                              : { scale: 1 }
                          }
                          transition={
                            isActive
                              ? {
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                }
                              : { duration: 0.2 }
                          }
                          whileHover={{ scale: 1.2 }}
                        />
                        <span className="font-mono text-[9px] tracking-[0.05em] text-[color:var(--color-text-dim)]">
                          {String(stepMeta.step).padStart(2, "0")}.{orderNum}
                        </span>
                        <span
                          className={`flex-1 truncate text-[11px] leading-tight transition-colors duration-200 group-hover:text-[color:var(--color-accent)] ${
                            isActive
                              ? "text-[color:var(--color-accent)]"
                              : isVisited
                                ? "text-[color:var(--color-text-secondary)]"
                                : "text-[color:var(--color-text-muted)]"
                          }`}
                          style={{ fontFamily: "var(--font-display)" }}
                        >
                          {c.title}
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </motion.ol>
            </AnimatePresence>
          </motion.div>
        )}

        {/* Home page overview — show the 7 steps with visited indicators */}
        {isHome && (
          <motion.div variants={fadeUp} className="mt-5">
            <div className="mb-3 font-mono text-[9px] uppercase tracking-[0.3em] text-[color:var(--color-text-muted)]">
              The 7 steps
            </div>
            <ol className="flex flex-col gap-2">
              {STEPS.map((s, idx) => {
                const stepTopics = getTopicsByStep(s.step);
                const v = stepTopics.filter((t) => visited.has(t.id)).length;
                const complete = v === stepTopics.length && stepTopics.length > 0;
                return (
                  <motion.li
                    key={s.step}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      ease: ease.out,
                      delay: 0.05 * idx,
                    }}
                  >
                    <Link
                      href={`/steps/${s.slug}`}
                      className="group flex items-center gap-2"
                    >
                      <motion.span
                        aria-hidden
                        className="block h-1.5 w-1.5 shrink-0 rounded-full border"
                        style={{
                          borderColor: complete
                            ? "var(--color-accent)"
                            : v > 0
                              ? "var(--color-text-muted)"
                              : "var(--color-text-dim)",
                          background:
                            complete
                              ? "var(--color-accent)"
                              : v > 0
                                ? "var(--color-text-muted)"
                                : "transparent",
                        }}
                        whileHover={{ scale: 1.2 }}
                      />
                      <span className="font-mono text-[9px] tracking-[0.05em] text-[color:var(--color-text-dim)]">
                        {String(s.step).padStart(2, "0")}
                      </span>
                      <span
                        className="flex-1 truncate text-[11px] leading-tight text-[color:var(--color-text-muted)] transition-colors duration-200 group-hover:text-[color:var(--color-accent)]"
                        style={{ fontFamily: "var(--font-display)" }}
                      >
                        {s.title}
                      </span>
                    </Link>
                  </motion.li>
                );
              })}
            </ol>
          </motion.div>
        )}
      </motion.div>
    </motion.nav>
  );
}

function ProgressRings({
  sectionPct,
  journeyPct,
  stepNum,
  hasSection,
}: {
  sectionPct: number;
  journeyPct: number;
  stepNum?: number;
  hasSection: boolean;
}) {
  const size = 72;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 30;
  const innerR = 22;
  const outerC = 2 * Math.PI * outerR;
  const innerC = 2 * Math.PI * innerR;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        aria-hidden
      >
        {/* Outer track */}
        <circle
          cx={cx}
          cy={cy}
          r={outerR}
          stroke="var(--color-border)"
          strokeWidth="2"
        />
        {/* Outer arc — section (or journey on home) */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={outerR}
          stroke="var(--color-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={outerC}
          initial={{ strokeDashoffset: outerC }}
          animate={{ strokeDashoffset: outerC * (1 - sectionPct) }}
          transition={{ duration: 0.6, ease: ease.out }}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
        {/* Inner track */}
        <circle
          cx={cx}
          cy={cy}
          r={innerR}
          stroke="var(--color-border)"
          strokeWidth="1.5"
        />
        {/* Inner arc — journey */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={innerR}
          stroke="var(--color-accent)"
          strokeOpacity={0.5}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={innerC}
          initial={{ strokeDashoffset: innerC }}
          animate={{ strokeDashoffset: innerC * (1 - journeyPct) }}
          transition={{ duration: 0.6, ease: ease.out, delay: 0.08 }}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span
          className="font-mono text-[11px] tracking-[0.06em] text-[color:var(--color-text-primary)]"
          aria-label={
            hasSection && stepNum
              ? `Step ${stepNum}`
              : `${Math.round(journeyPct * 100)} percent complete`
          }
        >
          {hasSection && stepNum ? String(stepNum).padStart(2, "0") : "—"}
        </span>
      </div>
    </div>
  );
}

function parsePath(pathname: string): {
  stepSlug?: string;
  conceptId?: string;
} {
  const m = pathname.match(/^\/steps\/(\d{2}-[^/]+)(?:\/([^/]+))?/);
  if (!m) return {};
  return { stepSlug: m[1], conceptId: m[2] };
}
