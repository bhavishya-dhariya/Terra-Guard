import Panel from "../ui/Panel";
import TypewriterText from "../ui/TypewriterText";

export default function NarratorFeed({
  narration,
  surpriseEvent,
  streaming,
}: {
  narration: string;
  surpriseEvent: string | null;
  streaming: boolean;
}) {
  return (
    <div className="space-y-3">
      {surpriseEvent ? (
        <div className="border border-[var(--accent-red)] bg-[rgba(255,45,45,0.06)] px-4 py-3 shadow-[var(--glow-red)] animate-[surpriseIn_280ms_ease_both]">
          <div className="font-mono text-[11px] tracking-[0.22em] text-[var(--accent-red)]">
            SURPRISE EVENT
          </div>
          <div className="mt-2 text-sm text-[var(--text-primary)]">{surpriseEvent}</div>
          <style>{`
            @keyframes surpriseIn { from { opacity: 0; transform: translateY(-10px);} to { opacity: 1; transform: translateY(0);} }
          `}</style>
        </div>
      ) : null}

      <Panel className="p-5">
        <div className="font-mono text-[11px] tracking-[0.22em] text-[var(--text-muted)]">
          NARRATOR FEED
        </div>
        <div className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
          {streaming ? (
            <TypewriterText text={narration} />
          ) : (
            <div>{narration}</div>
          )}
        </div>
      </Panel>
    </div>
  );
}

