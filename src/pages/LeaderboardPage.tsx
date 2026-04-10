import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";

type Entry = {
  id: string;
  timestamp: string;
  role: string;
  disaster: string;
  livesSaved: number;
  livesLost: number;
  xp: number;
  grade: string;
  sessionId: string;
};

const KEY = "crisiscommand_leaderboard";

function seed(): Entry[] {
  return [
    {
      id: "seed-1",
      timestamp: new Date().toISOString(),
      role: "coordinator",
      disaster: "cyclone",
      livesSaved: 847,
      livesLost: 222,
      xp: 98200,
      grade: "A",
      sessionId: "CC-SEED-4821",
    },
    {
      id: "seed-2",
      timestamp: new Date().toISOString(),
      role: "official",
      disaster: "pandemic",
      livesSaved: 4200,
      livesLost: 1200,
      xp: 121500,
      grade: "B",
      sessionId: "CC-SEED-7734",
    },
    {
      id: "seed-3",
      timestamp: new Date().toISOString(),
      role: "citizen",
      disaster: "earthquake",
      livesSaved: 12,
      livesLost: 3,
      xp: 1900,
      grade: "S",
      sessionId: "CC-SEED-0293",
    },
  ];
}

export default function LeaderboardPage() {
  const nav = useNavigate();
  const entries = useMemo(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return seed();
      const parsed = JSON.parse(raw) as Entry[];
      return parsed.length ? parsed : seed();
    } catch {
      return seed();
    }
  }, []);

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="font-mono text-xs tracking-[0.3em] text-[var(--text-secondary)]">
            LEADERBOARD NODE
          </div>
          <h1 className="mt-2 font-mono text-3xl tracking-[0.12em]">TOP SCORES</h1>
        </div>
        <Button variant="ghost" onClick={() => nav("/")}>
          HOME
        </Button>
      </div>

      <div className="mt-8 overflow-x-auto border border-[var(--border)] bg-[var(--bg-surface)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
        <table className="min-w-[860px] w-full border-collapse">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--bg-elevated)] font-mono text-[11px] tracking-[0.22em] text-[var(--text-muted)]">
              <th className="px-4 py-3 text-left">RANK</th>
              <th className="px-4 py-3 text-left">PLAYER</th>
              <th className="px-4 py-3 text-left">ROLE</th>
              <th className="px-4 py-3 text-left">DISASTER</th>
              <th className="px-4 py-3 text-left">SAVED</th>
              <th className="px-4 py-3 text-left">XP</th>
              <th className="px-4 py-3 text-left">GRADE</th>
            </tr>
          </thead>
          <tbody>
            {entries
              .slice()
              .sort((a, b) => b.xp - a.xp)
              .slice(0, 10)
              .map((e, idx) => (
                <tr
                  key={e.id}
                  className="border-b border-[var(--border)] text-sm text-[var(--text-secondary)]"
                  style={{ animation: `rowIn 420ms ease ${(idx * 60) / 1000}s both` }}
                >
                  <td className="px-4 py-3 font-mono text-xs">{idx + 1}</td>
                  <td className="px-4 py-3 font-mono text-xs">Commander #{e.sessionId.slice(-4)}</td>
                  <td className="px-4 py-3">{e.role}</td>
                  <td className="px-4 py-3">{e.disaster}</td>
                  <td className="px-4 py-3 font-mono text-[var(--accent-green)]">{e.livesSaved.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono text-[var(--text-primary)]">{e.xp.toLocaleString()}</td>
                  <td className="px-4 py-3 font-mono">{e.grade}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <style>{`
        @keyframes rowIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}

