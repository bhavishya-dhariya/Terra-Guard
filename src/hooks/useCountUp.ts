import { useEffect, useRef, useState } from "react";

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

export function useCountUp(value: number, durationMs = 600) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    fromRef.current = value;
    const start = performance.now();

    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / durationMs);
      const eased = easeOutCubic(p);
      const next = from + (to - from) * eased;
      setDisplay(next);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, durationMs]);

  return display;
}

