import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import LoadingTerminal from "../components/ui/LoadingTerminal";
import TypewriterText from "../components/ui/TypewriterText";
import { GameContext } from "../context/GameContext";
import { calculateEndGameBonus, gradeFromSurvivalRate, survivalRate } from "../lib/scoring";

export default function DebriefPage() {
  const nav = useNavigate();
  const { state, actions } = useContext(GameContext);
  const [copied, setCopied] = useState(false);

  const rate = useMemo(
    () => survivalRate(state.livesSaved, state.livesLost),
    [state.livesSaved, state.livesLost]
  );
  const grade = useMemo(() => gradeFromSurvivalRate(rate), [rate]);
  const bonus = useMemo(
    () => calculateEndGameBonus({ maxThreatReached: state.maxThreatReached }),
    [state.maxThreatReached]
  );
  const totalXp = state.xp + bonus;

  useEffect(() => {
    if (!state.role || !state.disaster) return;
    if (state.debriefReport) return;
    if (state.isStreaming) return;
    actions.generateDebrief();
  }, [state.role, state.disaster, state.debriefReport, state.isStreaming, actions]);

  useEffect(() => {
    if (!state.role || !state.disaster) return;
    if (!state.debriefReport) return;

    const entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      role: state.role,
      disaster: state.disaster,
      livesSaved: state.livesSaved,
      livesLost: state.livesLost,
      xp: totalXp,
      grade,
      sessionId: state.sessionId,
    };

    const key = "crisiscommand_leaderboard";
    try {
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const next = Array.isArray(existing) ? existing : [];
      next.unshift(entry);
      const capped = next.slice(0, 50).sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0));
      localStorage.setItem(key, JSON.stringify(capped));
    } catch {
      localStorage.setItem(key, JSON.stringify([entry]));
    }
  }, [
    state.role,
    state.disaster,
    state.debriefReport,
    state.livesSaved,
    state.livesLost,
    state.sessionId,
    totalXp,
    grade,
  ]);

  const gradeColor =
    grade === "S" || grade === "A"
      ? "var(--accent-green)"
      : grade === "B"
        ? "var(--accent-amber)"
        : "var(--accent-red)";

  async function copyScore() {
    if (!state.role || !state.disaster) return;
    const text = `I just scored ${totalXp.toLocaleString()} XP as a ${state.role} in a ${state.disaster} scenario on Crisis Command. ${state.livesSaved.toLocaleString()} lives saved. Grade: ${grade}. Can you beat it?`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-10">
      <div className="text-center">
        <div
          className="mx-auto inline-flex items-center justify-center border border-[var(--border)] bg-[var(--bg-elevated)] px-6 py-4 font-mono text-5xl tracking-[0.18em] [animation:gradeIn_520ms_cubic-bezier(0.2,1.4,0.3,1)_both]"
          style={{ color: gradeColor }}
        >
          {grade}
        </div>
        <div className="mt-4 font-mono text-xs tracking-[0.28em] text-[var(--text-secondary)]">
          CRISIS COMMAND — AFTER ACTION REPORT
        </div>
        <div className="mt-2 font-mono text-[11px] tracking-[0.22em] text-[var(--text-muted)]">
          XP: <span className="text-[var(--text-secondary)]">{totalXp.toLocaleString()}</span>{" "}
          | SURVIVAL:{" "}
          <span className="text-[var(--text-secondary)]">
            {(rate * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="mt-8 border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
        {state.isStreaming && !state.debriefReport ? (
          <LoadingTerminal label="GENERATING AFTER-ACTION REPORT..." />
        ) : null}

        {state.error ? (
          <div className="mt-3 font-mono text-xs text-[var(--accent-red)]">
            ERROR: {state.error}
          </div>
        ) : null}

        <div className="mt-4 whitespace-pre-wrap font-mono text-xs leading-6 text-[var(--text-secondary)]">
          {state.debriefReport ? (
            <TypewriterText text={state.debriefReport} charsPerSecond={60} />
          ) : (
            <div className="text-[var(--text-muted)]">Awaiting report…</div>
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button
          variant="primary"
          onClick={() => {
            actions.reset();
            nav("/select");
          }}
        >
          PLAY AGAIN
        </Button>
        <Button variant="ghost" onClick={() => nav("/select")}>
          CHANGE ROLE
        </Button>
        <Button variant="ghost" onClick={() => nav("/leaderboard")}>
          VIEW LEADERBOARD
        </Button>
        <Button variant="ghost" onClick={copyScore}>
          {copied ? "COPIED" : "SHARE SCORE"}
        </Button>
      </div>

      <style>{`
        @keyframes gradeIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

