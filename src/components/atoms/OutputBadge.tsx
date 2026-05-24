interface Props {
  label: string;
  type: string;
}

export function OutputBadge({ label, type }: Props) {
  return (
    <div className="inline-flex items-baseline gap-2 font-mono text-[10px] uppercase tracking-[0.22em]">
      <span className="text-[color:var(--color-text-muted)]">
        {label}:
      </span>
      <span className="text-[color:var(--color-accent)]">
        {type}
      </span>
    </div>
  );
}
