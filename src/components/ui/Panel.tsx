import type { HTMLAttributes } from "react";

export default function Panel({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "border border-[var(--border)] bg-[var(--bg-surface)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]",
        className,
      ].join(" ")}
      {...props}
    />
  );
}

