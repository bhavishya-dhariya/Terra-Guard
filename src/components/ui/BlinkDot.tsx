export default function BlinkDot({ color }: { color: "red" | "green" | "amber" | "blue" }) {
  const c =
    color === "red"
      ? "bg-[var(--accent-red)] shadow-[var(--glow-red)]"
      : color === "green"
        ? "bg-[var(--accent-green)] shadow-[var(--glow-green)]"
        : color === "amber"
          ? "bg-[var(--accent-amber)] shadow-[var(--glow-amber)]"
          : "bg-[var(--accent-blue)]";

  return <span className={`h-2 w-2 animate-[blink_1s_steps(2,end)_infinite] ${c}`} />;
}

