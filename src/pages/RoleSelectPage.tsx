import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { GameContext } from "../context/GameContext";
import type { DisasterType, Role } from "../types/game";

export default function RoleSelectPage() {
  const nav = useNavigate();
  const { actions } = useContext(GameContext);
  const [role, setRole] = useState<Role | null>(null);
  const [disaster, setDisaster] = useState<DisasterType | null>(null);
  const [loading, setLoading] = useState(false);

  const disasters = useMemo(
    () =>
      [
        { id: "earthquake", emoji: "🌍", name: "EARTHQUAKE", teaser: "Aftershock timer." },
        { id: "flash_flood", emoji: "🌊", name: "FLASH FLOOD", teaser: "Roads cut off." },
        { id: "urban_fire", emoji: "🔥", name: "URBAN FIRE", teaser: "Wind shift spread." },
        { id: "cyclone", emoji: "🌀", name: "CYCLONE", teaser: "Landfall countdown." },
        { id: "pandemic", emoji: "🦠", name: "PANDEMIC", teaser: "R-value spread." },
        { id: "chemical_spill", emoji: "☣", name: "CHEMICAL SPILL", teaser: "Plume direction." },
        { id: "tsunami", emoji: "🌊", name: "TSUNAMI", teaser: "Wave ETA." },
        { id: "power_grid_failure", emoji: "⚡", name: "POWER GRID", teaser: "Cascading outages." },
      ] as const,
    []
  );

  async function deploy() {
    setLoading(true);
    if (role && disaster) {
      actions.configure(role, disaster);
      localStorage.setItem(
        "crisiscommand_last_config",
        JSON.stringify({ role, disaster })
      );
    }
    await new Promise((r) => setTimeout(r, 3000));
    nav("/game");
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-10">
      <div className="font-mono text-xs tracking-[0.3em] text-[var(--text-secondary)]">
        ESTABLISH MISSION PARAMETERS
      </div>
      <h1 className="mt-3 font-mono text-3xl tracking-[0.12em]">ROLE + DISASTER SELECT</h1>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
          <div className="font-mono text-xs tracking-[0.28em] text-[var(--text-muted)]">
            ROLE
          </div>
          <div className="mt-4 grid gap-3">
            {([
              {
                id: "citizen",
                title: "CITIZEN",
                desc: "Survival choices, first aid, panic navigation.",
                diff: "★★☆",
              },
              {
                id: "coordinator",
                title: "COORDINATOR",
                desc: "Triage, deployment, resource allocation under pressure.",
                diff: "★★★",
              },
              {
                id: "official",
                title: "OFFICIAL",
                desc: "Public comms, agency coordination, misinformation.",
                diff: "★★★",
              },
            ] as const).map((r) => {
              const active = role === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  className={[
                    "text-left border px-4 py-4 transition",
                    "border-[var(--border)] bg-[var(--bg-elevated)]",
                    active
                      ? "border-[var(--accent-red)] shadow-[var(--glow-red)]"
                      : "hover:border-[var(--text-secondary)]",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-mono text-sm tracking-[0.22em]">{r.title}</div>
                    <div className="font-mono text-xs text-[var(--accent-amber)]">
                      {r.diff}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-[var(--text-secondary)]">{r.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="border border-[var(--border)] bg-[var(--bg-surface)] p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]">
          <div className="font-mono text-xs tracking-[0.28em] text-[var(--text-muted)]">
            DISASTER
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            {disasters.map((d) => {
              const active = disaster === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => setDisaster(d.id)}
                  className={[
                    "border px-3 py-3 text-left transition",
                    "border-[var(--border)] bg-[var(--bg-elevated)]",
                    active
                      ? "border-[var(--accent-red)] shadow-[var(--glow-red)]"
                      : "hover:border-[var(--text-secondary)]",
                  ].join(" ")}
                  title={d.teaser}
                >
                  <div className="text-lg">{d.emoji}</div>
                  <div className="mt-1 font-mono text-[11px] tracking-[0.2em]">
                    {d.name}
                  </div>
                  <div className="mt-1 text-[11px] text-[var(--text-secondary)]">
                    {d.teaser}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={() => nav("/")}>
          BACK
        </Button>
        <Button
          variant="primary"
          disabled={!role || !disaster || loading}
          onClick={deploy}
        >
          {loading ? "ESTABLISHING SECURE CONNECTION..." : "DEPLOY TO CRISIS"}
        </Button>
      </div>
    </div>
  );
}

