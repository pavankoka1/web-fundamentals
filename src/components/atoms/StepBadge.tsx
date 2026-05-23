export interface StepBadgeProps {
  step: number;
  total?: number;
  label?: string;
  className?: string;
}

export function StepBadge({ step, total = 7, label, className = "" }: StepBadgeProps) {
  return (
    <div
      className={`inline-flex items-baseline gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[color:var(--color-text-muted)] ${className}`}
    >
      <span className="text-[color:var(--color-accent)]">
        {String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>
      {label && (
        <>
          <span className="h-px w-6 bg-[color:var(--color-border)]" aria-hidden />
          <span>{label}</span>
        </>
      )}
    </div>
  );
}
