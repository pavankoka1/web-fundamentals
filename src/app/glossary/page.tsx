import type { Metadata } from "next";
import Link from "next/link";
import { topics, TOPIC_STEP_MAP } from "@/data/topics";
import { stepByNumber } from "@/lib/steps";
import { GradientRule } from "@/components/atoms/GradientRule";

export const metadata: Metadata = {
  title: "Glossary",
  description: "Every concept in web-internals — alphabetical index.",
  alternates: { canonical: "/glossary" },
};

interface Entry {
  id: string;
  title: string;
  subtitle: string;
  step: number;
  stepSlug: string;
  globalOrder: number;
}

export default function GlossaryPage() {
  const entries: Entry[] = topics
    .filter((t) => TOPIC_STEP_MAP[t.id])
    .map((t) => {
      const m = TOPIC_STEP_MAP[t.id];
      const step = stepByNumber(m.step);
      return {
        id: t.id,
        title: t.title,
        subtitle: t.subtitle ?? "",
        step: m.step,
        stepSlug: step?.slug ?? "",
        globalOrder: m.globalOrder,
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <main className="relative z-10 mx-auto max-w-[840px] px-8 pt-32 pb-24 lg:pl-24">
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
        web-internals · reference
      </div>
      <h1
        style={{ fontFamily: "var(--font-display)", fontSize: "var(--type-hero)" }}
        className="mt-3 leading-[1.05] tracking-[-0.018em] text-[color:var(--color-text-primary)]"
      >
        Glossary
      </h1>
      <p className="mt-6 max-w-[58ch] text-[18px] leading-[1.55] text-[color:var(--color-text-secondary)]">
        Every concept across the seven steps. Alphabetical for quick lookup. The
        tutorial reads in order; this page is the index.
      </p>
      <div className="mt-12"><GradientRule /></div>

      <ul className="mt-8 divide-y divide-[color:var(--color-border)]">
        {entries.map((e) => (
          <li key={e.id} className="py-5">
            <Link
              href={`/steps/${e.stepSlug}/${e.id}`}
              className="group flex items-baseline gap-6 hover:bg-[color:var(--color-accent-soft)] -mx-4 px-4 py-2 rounded transition-colors"
            >
              <span className="min-w-[2.5rem] font-mono text-[10px] uppercase tracking-[0.18em] text-[color:var(--color-text-dim)]">
                #{String(e.globalOrder).padStart(2, "0")}
              </span>
              <div className="flex-1">
                <h2
                  style={{ fontFamily: "var(--font-display)" }}
                  className="text-[18px] leading-tight text-[color:var(--color-text-primary)] group-hover:text-[color:var(--color-accent)] transition-colors"
                >
                  {e.title}
                </h2>
                {e.subtitle && (
                  <p className="mt-1 text-[13px] text-[color:var(--color-text-secondary)]">
                    {e.subtitle}
                  </p>
                )}
              </div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[color:var(--color-text-muted)]">
                step {String(e.step).padStart(2, "0")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
