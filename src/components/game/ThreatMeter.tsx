import type { ThreatLevel } from "../../types/game";

export default function ThreatMeter({ level }: { level: ThreatLevel }) {
  const pct = (level / 10) * 100;
  const color =
    level >= 8
      ? "var(--accent-red)"
      : level >= 5
        ? "var(--accent-amber)"
        : "var(--accent-green)";

  return (
    <div className="flex items-center gap-4">
      <div className="flex-1">
        <div className="flex items-baseline justify-between font-mono text-[11px] tracking-[0.22em] text-[var(--text-muted)]">
          <span>THREAT</span>
          <span className="text-[var(--text-secondary)]">{level}/10</span>
        </div>
        <div className="mt-2 h-2 w-full border border-[var(--border)] bg-black/20">
          <div
            className="h-full"
            style={{
              width: `${pct}%`,
              background: color,
              boxShadow:
                level >= 8
                  ? "var(--glow-red)"
                  : level >= 5
                    ? "var(--glow-amber)"
                    : "var(--glow-green)",
              transition: "width 500ms ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

