import BlinkDot from "./BlinkDot";

export default function LoadingTerminal({ label = "STREAMING..." }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs tracking-[0.22em] text-[var(--text-secondary)]">
      <BlinkDot color="amber" />
      <span>{label}</span>
      <span className="inline-block w-3 animate-[blink_0.9s_steps(2,end)_infinite] text-[var(--text-muted)]">
        _
      </span>
    </div>
  );
}

