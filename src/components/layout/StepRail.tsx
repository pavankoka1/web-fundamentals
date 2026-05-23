"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { STEPS } from "@/lib/steps";
import { railDotActive } from "@/lib/motion";

export function StepRail() {
  const pathname = usePathname();
  const activeStep = parseActiveStep(pathname);

  return (
    <nav
      aria-label="Tutorial steps"
      className="fixed left-8 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
    >
      <ol className="flex flex-col gap-4">
        {STEPS.map((s) => {
          const isActive = activeStep === s.step;
          const isVisited = activeStep !== null && activeStep > s.step;
          return (
            <li key={s.step} className="group relative">
              <Link
                href={`/steps/${s.slug}`}
                className="block"
                aria-current={isActive ? "step" : undefined}
                aria-label={`Step ${s.step}: ${s.title}`}
              >
                <motion.span
                  className="block h-2 w-2 rounded-full border transition-all duration-200"
                  variants={railDotActive}
                  animate={isActive ? "pulse" : "rest"}
                  style={{
                    borderColor: isActive
                      ? "var(--color-accent)"
                      : isVisited
                      ? "var(--color-text-muted)"
                      : "var(--color-text-dim)",
                    background: isActive
                      ? "var(--color-accent)"
                      : isVisited
                      ? "var(--color-text-muted)"
                      : "transparent",
                  }}
                />
              </Link>
              <span
                className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-text-secondary)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              >
                Step {String(s.step).padStart(2, "0")} — {s.title}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function parseActiveStep(pathname: string): number | null {
  const m = pathname.match(/\/steps\/(\d{2})-/);
  return m ? parseInt(m[1], 10) : null;
}
