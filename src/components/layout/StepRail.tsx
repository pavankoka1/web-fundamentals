"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { STEPS } from "@/lib/steps";
import { railDotActive } from "@/lib/motion";

export function StepRail() {
  const pathname = usePathname();
  const activeStep = parseActiveStep(pathname);
  const total = STEPS.length;
  // Active index (0-based) for splitting the connecting line into visited/unvisited segments.
  // If no active step, treat as before-start (everything unvisited).
  const activeIndex = activeStep !== null
    ? STEPS.findIndex((s) => s.step === activeStep)
    : -1;
  // Each <li> has 8px dot height + 16px gap = 24px stride. Visited line spans from
  // the first dot's centre down to (and including) the active dot's centre.
  const STRIDE = 24; // px (gap-4 = 16, dot = 8)
  const visitedLength = activeIndex >= 0 ? activeIndex * STRIDE : 0;
  const totalLength = (total - 1) * STRIDE;

  return (
    <nav
      aria-label="Tutorial steps"
      className="fixed left-8 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
    >
      <div className="relative">
        {/* Connecting vertical line behind the dots. Two stacked segments:
            - top (visited): brighter
            - bottom (unvisited): dim */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1 -translate-x-1/2"
          style={{ width: 1, height: totalLength }}
        >
          {/* Unvisited (full length, dim) */}
          <div
            className="absolute inset-0"
            style={{
              background: "var(--color-accent-line)",
              opacity: 0.12,
            }}
          />
          {/* Visited (overlays from top) */}
          {visitedLength > 0 && (
            <div
              className="absolute left-0 top-0 w-full transition-[height] duration-500"
              style={{
                height: visitedLength,
                background: "var(--color-accent-line)",
                opacity: 0.55,
              }}
            />
          )}
        </div>

        <ol className="relative flex flex-col gap-4">
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
                    className="block h-2 w-2 rounded-full border"
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
                    variants={railDotActive}
                    animate={isActive ? "pulse" : "rest"}
                    whileHover={{ scale: 1.4 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  />
                </Link>
                <span
                  className="pointer-events-none absolute left-6 top-1/2 flex -translate-y-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-text-secondary)] opacity-0 transition-all duration-200 ease-out group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0"
                  style={{ transformOrigin: "left center" }}
                >
                  Step {String(s.step).padStart(2, "0")} — {s.title}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

function parseActiveStep(pathname: string): number | null {
  const m = pathname.match(/\/steps\/(\d{2})-/);
  return m ? parseInt(m[1], 10) : null;
}
