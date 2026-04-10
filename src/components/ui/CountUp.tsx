import { useCountUp } from "../../hooks/useCountUp";

type Format = "plain" | "compact";

function formatCompact(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (abs >= 1_000) return `${Math.round(n / 1_000)}K`;
  return `${Math.round(n)}`;
}

export default function CountUp({
  to,
  durationMs = 600,
  format = "plain",
}: {
  to: number;
  durationMs?: number;
  format?: Format;
}) {
  const display = useCountUp(to, durationMs);
  const out =
    format === "compact" ? formatCompact(display) : Math.round(display).toLocaleString();
  return <span>{out}</span>;
}

