import type { Resources } from "../../types/game";

export default function ResourceBar({ resources }: { resources: Resources }) {
  return (
    <div className="space-y-2">
      <div className="font-mono text-[11px] tracking-[0.22em] text-[var(--text-muted)]">
        RESOURCES
      </div>
      <div className="grid gap-2">
        <div className="flex items-center justify-between border border-[var(--border)] bg-black/10 px-3 py-2">
          <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--text-secondary)]">
            AMBULANCES
          </div>
          <div className="font-mono text-xs text-[var(--text-primary)]">
            {resources.ambulances.available}/{resources.ambulances.total}
          </div>
        </div>
        <div className="flex items-center justify-between border border-[var(--border)] bg-black/10 px-3 py-2">
          <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--text-secondary)]">
            RESCUE TEAMS
          </div>
          <div className="font-mono text-xs text-[var(--text-primary)]">
            {resources.rescueTeams.available}/{resources.rescueTeams.total}
          </div>
        </div>
        <div className="flex items-center justify-between border border-[var(--border)] bg-black/10 px-3 py-2">
          <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--text-secondary)]">
            HELICOPTERS
          </div>
          <div className="font-mono text-xs text-[var(--text-primary)]">
            {resources.helicopters.available}/{resources.helicopters.total}
          </div>
        </div>
        <div className="flex items-center justify-between border border-[var(--border)] bg-black/10 px-3 py-2">
          <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--text-secondary)]">
            BUDGET
          </div>
          <div className="font-mono text-xs text-[var(--text-primary)]">
            ${resources.budget.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}

