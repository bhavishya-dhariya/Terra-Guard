import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CountUp from "../components/ui/CountUp";
import BlinkDot from "../components/ui/BlinkDot";
import Button from "../components/ui/Button";
import { useHindsight } from "../hooks/useHindsight";

export default function HomePage() {
  const nav = useNavigate();
  const hindsight = useHindsight();

  useEffect(() => {
    document.title = "Crisis Command";
  }, []);

  return (
    <div className="relative min-h-[calc(100vh)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(26,45,64,0.18)_1px,transparent_1px),linear-gradient(90deg,rgba(26,45,64,0.18)_1px,transparent_1px)] bg-[size:56px_56px]" />
      </div>

      {/* Ambient particles (CSS only) */}
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: 26 }).map((_, i) => (
          <span
            key={i}
            className="absolute h-1 w-1 bg-white/20"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 23) % 100}%`,
              animation: `floaty ${8 + (i % 7)}s ease-in-out ${
                (i % 9) * 0.3
              }s infinite alternate`,
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-6 text-center">
        <div className="font-mono text-[14px] tracking-[0.35em] text-[var(--text-secondary)]">
          EMERGENCY SIMULATION NODE ONLINE
        </div>

        <h1 className="mt-4 font-mono text-[72px] leading-[0.95] tracking-[0.08em] text-[var(--text-primary)] [text-shadow:var(--glow-red)] md:text-[92px]">
          CRISIS COMMAND
        </h1>

        <div className="mt-4 max-w-xl text-sm uppercase tracking-[0.28em] text-[var(--text-secondary)]">
          AI-POWERED DISASTER SIMULATION
        </div>

        <div className="mt-10 grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
            <div className="font-mono text-xs tracking-[0.25em] text-[var(--text-muted)]">
              GLOBAL STAT
            </div>
            <div className="mt-2 font-mono text-2xl text-[var(--accent-green)] [text-shadow:var(--glow-green)]">
              <CountUp to={2400000} durationMs={1200} format="compact" /> lives
            </div>
            <div className="mt-1 text-xs text-[var(--text-secondary)]">
              simulated
            </div>
          </div>
          <div className="border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
            <div className="font-mono text-xs tracking-[0.25em] text-[var(--text-muted)]">
              GLOBAL STAT
            </div>
            <div className="mt-2 font-mono text-2xl text-[var(--accent-blue)]">
              <CountUp to={847000} durationMs={1200} format="compact" />{" "}
              decisions
            </div>
            <div className="mt-1 text-xs text-[var(--text-secondary)]">made</div>
          </div>
          <div className="border border-[var(--border)] bg-[var(--bg-surface)] px-5 py-4 text-left shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
            <div className="font-mono text-xs tracking-[0.25em] text-[var(--text-muted)]">
              GLOBAL STAT
            </div>
            <div className="mt-2 font-mono text-2xl text-[var(--accent-amber)] [text-shadow:var(--glow-amber)]">
              <CountUp to={193} durationMs={1200} /> cities
            </div>
            <div className="mt-1 text-xs text-[var(--text-secondary)]">
              represented
            </div>
          </div>
        </div>

        <div className="mt-10 flex w-full max-w-xl flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="primary"
            onClick={() => nav("/select")}
            className="w-full sm:w-auto"
          >
            ENTER SIMULATION
          </Button>
          <Button
            variant="ghost"
            onClick={() => nav("/leaderboard")}
            className="w-full sm:w-auto"
          >
            VIEW LEADERBOARD
          </Button>
        </div>

        <div className="mt-12 flex items-center gap-3 font-mono text-xs tracking-[0.28em] text-[var(--accent-red)]">
          <BlinkDot color="red" />
          <span>LIVE SCENARIOS ACTIVE</span>
        </div>
      </div>

      <div className="absolute bottom-5 left-6 flex items-center gap-3 font-mono text-[11px] tracking-[0.22em]">
        <BlinkDot color="blue" />
        {hindsight.isReady ? (
          <span className="text-[var(--accent-blue)]">
            MEMORY BANK ACTIVE — {hindsight.sessionsRemembered} SESSIONS REMEMBERED
          </span>
        ) : (
          <span className="text-[var(--text-muted)]">MEMORY BANK OFFLINE</span>
        )}
      </div>

      <style>{`
        @keyframes floaty {
          from { transform: translateY(0px); opacity: 0.18; }
          to { transform: translateY(-18px); opacity: 0.32; }
        }
      `}</style>
    </div>
  );
}

