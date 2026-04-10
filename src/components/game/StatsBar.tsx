import CountUp from "../ui/CountUp";

export default function StatsBar({
  livesSaved,
  livesLost,
  xp,
}: {
  livesSaved: number;
  livesLost: number;
  xp: number;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="border border-[var(--border)] bg-black/10 p-3">
        <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--text-muted)]">
          SAVED
        </div>
        <div className="mt-2 font-mono text-2xl text-[var(--accent-green)] [text-shadow:var(--glow-green)]">
          <CountUp to={livesSaved} />
        </div>
      </div>
      <div className="border border-[var(--border)] bg-black/10 p-3">
        <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--text-muted)]">
          LOST
        </div>
        <div className="mt-2 font-mono text-2xl text-[var(--accent-red)] [text-shadow:var(--glow-red)]">
          <CountUp to={livesLost} />
        </div>
      </div>
      <div className="border border-[var(--border)] bg-black/10 p-3">
        <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--text-muted)]">
          XP
        </div>
        <div className="mt-2 font-mono text-2xl text-[var(--text-primary)]">
          <CountUp to={xp} />
        </div>
      </div>
    </div>
  );
}

