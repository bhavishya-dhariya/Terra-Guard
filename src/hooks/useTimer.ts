import { useEffect, useRef, useState } from "react";

export function useTimer({
  seconds,
  running,
  onExpire,
}: {
  seconds: number;
  running: boolean;
  onExpire: () => void;
}) {
  const [remaining, setRemaining] = useState(seconds);
  const expiredRef = useRef(false);

  useEffect(() => {
    setRemaining(seconds);
    expiredRef.current = false;
  }, [seconds, running]);

  useEffect(() => {
    if (!running) return;
    const startedAt = performance.now();
    const startRemaining = remaining;

    const t = window.setInterval(() => {
      const elapsed = (performance.now() - startedAt) / 1000;
      const next = Math.max(0, Math.ceil(startRemaining - elapsed));
      setRemaining(next);
      if (next <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire();
      }
    }, 200);

    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running]);

  return remaining;
}

