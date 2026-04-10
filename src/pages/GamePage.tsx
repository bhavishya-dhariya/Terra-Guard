import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import DecisionPanel from "../components/game/DecisionPanel";
import EventLog from "../components/game/EventLog";
import MapOverlay from "../components/game/MapOverlay";
import NarratorFeed from "../components/game/NarratorFeed";
import ResourceBar from "../components/game/ResourceBar";
import StatsBar from "../components/game/StatsBar";
import ThreatMeter from "../components/game/ThreatMeter";
import TimerRing from "../components/game/TimerRing";
import Panel from "../components/ui/Panel";
import Button from "../components/ui/Button";
import LoadingTerminal from "../components/ui/LoadingTerminal";
import { GameContext } from "../context/GameContext";
import { useTimer } from "../hooks/useTimer";
import type { DisasterType } from "../types/game";

export default function GamePage() {
  const nav = useNavigate();
  const { state, actions } = useContext(GameContext);
  const [flash, setFlash] = useState<null | "red" | "green">(null);
  const prevSaved = useRef(state.livesSaved);
  const prevLost = useRef(state.livesLost);

  const ready = Boolean(state.role && state.disaster);

  const runningTimer =
    state.phase === "active" || state.phase === "escalating";
  const remaining = useTimer({
    seconds: state.timeRemaining,
    running: runningTimer && !state.isStreaming && state.choices.length > 0,
    onExpire: () => {
      actions.submitChoice("D", { timeout: true });
      setFlash("red");
      window.setTimeout(() => setFlash(null), 220);
    },
  });

  useEffect(() => {
    actions.tick(remaining);
  }, [remaining, actions]);

  useEffect(() => {
    const s = state.livesSaved;
    const l = state.livesLost;
    if (s > prevSaved.current) {
      setFlash("green");
      window.setTimeout(() => setFlash(null), 220);
    }
    if (l > prevLost.current) {
      setFlash("red");
      window.setTimeout(() => setFlash(null), 220);
    }
    prevSaved.current = s;
    prevLost.current = l;
  }, [state.livesSaved, state.livesLost]);

  useEffect(() => {
    if (!ready) return;
    if (state.round === 0 && !state.isStreaming && !state.error) {
      actions.initGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const narration = state.narratorText;
  const surpriseEvent = state.currentSurpriseEvent;

  return (
    <div className="relative">
      {flash ? (
        <div
          className="pointer-events-none fixed inset-0 z-[60]"
          style={{
            background:
              flash === "red"
                ? "rgba(255,45,45,0.2)"
                : "rgba(0,255,136,0.1)",
            animation: "flash 200ms ease both",
          }}
        />
      ) : null}

      <div className="mx-auto w-full max-w-[1280px] px-6 py-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-mono text-xs tracking-[0.3em] text-[var(--text-secondary)]">
              MAIN GAME SCREEN
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <div className="font-mono text-xl tracking-[0.18em] text-[var(--text-primary)]">
                ROUND {Math.max(1, state.round)} / {state.maxRounds}
              </div>
              <div className="font-mono text-[11px] tracking-[0.22em] text-[var(--text-muted)]">
                ROLE:{" "}
                <span className="text-[var(--text-secondary)]">
                  {(state.role ?? "—").toUpperCase()}
                </span>{" "}
                | DISASTER:{" "}
                <span className="text-[var(--text-secondary)]">
                  {(state.disaster ?? "—").toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => nav("/select")}>
              CHANGE
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                nav("/debrief");
              }}
            >
              DEBRIEF
            </Button>
          </div>
        </div>

        {!ready ? (
          <Panel className="mt-8 p-6">
            <div className="font-mono text-xs tracking-[0.22em] text-[var(--accent-red)]">
              MISSING PARAMETERS
            </div>
            <div className="mt-3 text-sm text-[var(--text-secondary)]">
              Return to role select to configure a mission.
            </div>
            <div className="mt-6">
              <Button variant="primary" onClick={() => nav("/select")}>
                GO TO ROLE SELECT
              </Button>
            </div>
          </Panel>
        ) : (
          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            {/* LEFT (25%) */}
            <div className="lg:col-span-3">
              <Panel className="p-4">
                <StatsBar
                  livesSaved={state.livesSaved}
                  livesLost={state.livesLost}
                  xp={state.xp}
                />
                <div className="mt-4">
                  <ThreatMeter level={state.threatLevel} />
                </div>
                {state.resources ? (
                  <div className="mt-5">
                    <ResourceBar resources={state.resources} />
                  </div>
                ) : null}
                <div className="mt-5">
                  <div className="font-mono text-[11px] tracking-[0.22em] text-[var(--text-muted)]">
                    EVENT LOG
                  </div>
                  <div className="mt-3">
                    <EventLog entries={state.eventLog} />
                  </div>
                </div>
              </Panel>
            </div>

            {/* CENTER (50%) */}
            <div className="lg:col-span-6">
              <div className="flex items-start justify-between gap-4">
                <div className="font-mono text-[11px] tracking-[0.22em] text-[var(--text-muted)]">
                  ROUND {Math.max(1, state.round)} / {state.maxRounds}
                </div>
                <TimerRing remaining={remaining} total={30} />
              </div>

              <div className="mt-4">
                {state.isStreaming ? (
                  <LoadingTerminal label="STREAMING DISASTER ENGINE..." />
                ) : null}
              </div>

              {state.error ? (
                <Panel className="mt-4 border-[var(--accent-red)] bg-[rgba(255,45,45,0.05)] p-4">
                  <div className="font-mono text-[11px] tracking-[0.22em] text-[var(--accent-red)]">
                    PARSE / STREAM ERROR
                  </div>
                  <div className="mt-2 text-sm text-[var(--text-secondary)]">
                    {state.error}
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Button
                      variant="primary"
                      onClick={() => actions.initGame()}
                      disabled={state.isStreaming}
                    >
                      RETRY
                    </Button>
                    <Button variant="ghost" onClick={() => nav("/select")}>
                      CHANGE ROLE/DISASTER
                    </Button>
                  </div>
                </Panel>
              ) : null}

              <div className="mt-4">
                <NarratorFeed
                  narration={narration}
                  surpriseEvent={surpriseEvent}
                  streaming={state.isStreaming}
                />
              </div>

              <div className="mt-4">
                {state.choices.length === 4 && !state.isStreaming ? (
                  <DecisionPanel
                    choices={state.choices}
                    disabled={state.isStreaming}
                    onPick={(id) => actions.submitChoice(id)}
                  />
                ) : (
                  <Panel className="p-4">
                    <div className="font-mono text-[11px] tracking-[0.22em] text-[var(--text-muted)]">
                      DECISIONS
                    </div>
                    <div className="mt-2 text-sm text-[var(--text-secondary)]">
                      Awaiting scenario output…
                    </div>
                  </Panel>
                )}
              </div>
            </div>

            {/* RIGHT (25%) */}
            <div className="lg:col-span-3">
              <Panel className="p-4">
                {state.disaster ? (
                  <MapOverlay
                    disaster={state.disaster as DisasterType}
                    round={state.round}
                    sessionId={state.sessionId}
                  />
                ) : null}
                <div className="mt-5">
                  <div className="font-mono text-[11px] tracking-[0.22em] text-[var(--text-muted)]">
                    INTEL FEED
                  </div>
                  <div className="mt-3 space-y-2 font-mono text-xs text-[var(--text-secondary)]">
                    <div>FEMA REGION 5 ON STANDBY</div>
                    <div>CELL TOWERS AT 40% CAPACITY</div>
                    <div>HOSPITAL TRIAGE QUEUES EXPANDING</div>
                    <div>PUBLIC ALERT CHANNELS DEGRADED</div>
                  </div>
                </div>

                <div className="mt-5">
                  <div className="font-mono text-[11px] tracking-[0.22em] text-[var(--text-muted)]">
                    COMMANDER INTEL
                  </div>
                  <div className="mt-3 space-y-2 font-mono text-xs">
                    {state.commanderIntel.length ? (
                      state.commanderIntel.slice(0, 3).map((l, i) => (
                        <div key={i} className="text-[var(--accent-amber)]">
                          ⚠ {l}
                        </div>
                      ))
                    ) : (
                      <div className="text-[var(--text-muted)]">MEMORY BANK OFFLINE</div>
                    )}
                  </div>
                </div>
              </Panel>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes flash { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

