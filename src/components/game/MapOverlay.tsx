import type { DisasterType } from "../../types/game";

function seededCells(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const rand = () => {
    h += 0x6d2b79f5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const cells: ("safe" | "hot" | "warn" | "player")[] = Array.from({ length: 100 }, () =>
    rand() > 0.86 ? "hot" : rand() > 0.76 ? "warn" : "safe"
  );
  cells[Math.floor(rand() * 100)] = "player";
  return cells;
}

export default function MapOverlay({
  disaster,
  round,
  sessionId,
}: {
  disaster: DisasterType;
  round: number;
  sessionId: string;
}) {
  const cells = seededCells(`${sessionId}-${disaster}-${round}`);
  return (
    <div>
      <div className="flex items-baseline justify-between font-mono text-[11px] tracking-[0.22em] text-[var(--text-muted)]">
        <span>MAP OVERLAY</span>
        <span className="text-[var(--text-secondary)]">10×10</span>
      </div>
      <div className="mt-3 grid grid-cols-10 gap-[2px] bg-black/30 p-2">
        {cells.map((c, i) => (
          <div
            key={i}
            className="h-4 w-4 border border-[rgba(26,45,64,0.7)]"
            style={{
              background:
                c === "hot"
                  ? "rgba(255,45,45,0.55)"
                  : c === "warn"
                    ? "rgba(255,184,0,0.45)"
                    : c === "player"
                      ? "rgba(0,170,255,0.55)"
                      : "rgba(0,255,136,0.08)",
              boxShadow:
                c === "player"
                  ? "0 0 14px rgba(0,170,255,0.35)"
                  : c === "hot"
                    ? "0 0 12px rgba(255,45,45,0.28)"
                    : "none",
            }}
            aria-label={c}
          />
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono tracking-[0.18em] text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-[rgba(255,45,45,0.7)] shadow-[var(--glow-red)]" />
          AFFECTED
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 bg-[rgba(0,170,255,0.7)]" />
          COMMAND
        </div>
      </div>
    </div>
  );
}

