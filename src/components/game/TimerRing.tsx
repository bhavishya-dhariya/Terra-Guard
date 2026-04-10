import { useMemo } from "react";

export default function TimerRing({
  remaining,
  total = 30,
  size = 92,
}: {
  remaining: number;
  total?: number;
  size?: number;
}) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, remaining / total));
  const dash = useMemo(() => c * pct, [c, pct]);
  const color =
    remaining <= 8
      ? "var(--accent-red)"
      : remaining <= 15
        ? "var(--accent-amber)"
        : "var(--accent-green)";

  const blink = remaining <= 5;

  return (
    <div className="relative grid place-items-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        className={blink ? "animate-[blink_1s_steps(2,end)_infinite]" : ""}
      >
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="rgba(232,237,242,0.08)"
          strokeWidth="3"
        />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={`${c - dash}`}
          strokeLinecap="square"
          style={{
            transform: "rotate(-90deg)",
            transformOrigin: "50% 50%",
            transition: "stroke 150ms ease, stroke-dashoffset 200ms linear",
          }}
        />
      </svg>
      <div className="absolute font-mono text-[11px] tracking-[0.18em] text-[var(--text-secondary)]">
        {remaining}s
      </div>
    </div>
  );
}

