import type { Choice } from "../../types/game";
import Button from "../ui/Button";

export default function DecisionPanel({
  choices,
  disabled,
  onPick,
}: {
  choices: Choice[];
  disabled: boolean;
  onPick: (id: string) => void;
}) {
  const dots = (risk: Choice["riskLevel"]) =>
    risk === "low"
      ? "bg-[var(--accent-green)] shadow-[var(--glow-green)]"
      : risk === "medium"
        ? "bg-[var(--accent-amber)] shadow-[var(--glow-amber)]"
        : risk === "high"
          ? "bg-[var(--accent-red)] shadow-[var(--glow-red)]"
          : "bg-[var(--text-muted)]";

  return (
    <div className="grid gap-2">
      {choices.map((c, idx) => (
        <button
          key={c.id}
          disabled={disabled}
          onClick={() => onPick(c.id)}
          className={[
            "border border-[var(--border)] bg-[var(--bg-elevated)] px-4 py-4 text-left transition",
            "hover:border-[var(--text-primary)] hover:text-[var(--text-primary)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "animate-[choiceIn_260ms_ease_both]",
          ].join(" ")}
          style={{ animationDelay: `${idx * 0.1}s` }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-mono text-xs tracking-[0.22em] text-[var(--text-primary)]">
                {c.id}. {c.label}
              </div>
              <div className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">
                {c.subtext}
              </div>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <span className={`h-2 w-2 ${dots(c.riskLevel)}`} />
              <span className="font-mono text-[10px] tracking-[0.22em] text-[var(--text-muted)]">
                {c.riskLevel.toUpperCase()}
              </span>
            </div>
          </div>
        </button>
      ))}

      <div className="hidden">
        <Button variant="primary">SPACER</Button>
      </div>

      <style>{`
        @keyframes choiceIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

