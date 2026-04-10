import type { LogEntry } from "../../types/game";

export default function EventLog({ entries }: { entries: LogEntry[] }) {
  return (
    <div className="max-h-[320px] overflow-auto pr-2">
      <div className="space-y-2">
        {entries.length === 0 ? (
          <div className="font-mono text-xs text-[var(--text-muted)]">NO EVENTS</div>
        ) : (
          entries.map((e, idx) => (
            <div key={idx} className="border border-[var(--border)] bg-black/10 px-3 py-2">
              <div className="flex items-baseline justify-between gap-3">
                <div className="font-mono text-[10px] tracking-[0.22em] text-[var(--text-muted)]">
                  {e.type.toUpperCase()}
                </div>
                <div className="font-mono text-[10px] text-[var(--text-muted)]">
                  {new Date(e.timestamp).toLocaleTimeString()}
                </div>
              </div>
              <div className="mt-1 text-xs leading-5 text-[var(--text-secondary)]">{e.text}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

