import { useEffect, useMemo, useRef, useState } from "react";

export default function TypewriterText({
  text,
  charsPerSecond = 40,
  className = "",
}: {
  text: string;
  charsPerSecond?: number;
  className?: string;
}) {
  const [shown, setShown] = useState(0);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);

  const target = text ?? "";

  useEffect(() => {
    setShown(0);
    lastRef.current = 0;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const tick = (now: number) => {
      if (!lastRef.current) lastRef.current = now;
      const dt = (now - lastRef.current) / 1000;
      lastRef.current = now;
      setShown((s) => {
        const next = Math.min(target.length, s + Math.max(1, Math.floor(dt * charsPerSecond)));
        return next;
      });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, charsPerSecond]);

  const visible = useMemo(() => target.slice(0, shown), [target, shown]);
  return <div className={className}>{visible}</div>;
}

