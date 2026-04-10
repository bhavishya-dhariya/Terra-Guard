import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type RecallResult = {
  id?: string;
  type?: string;
  content?: string;
  score?: number;
};

function extractResults(out: unknown): RecallResult[] {
  // We don't know the exact payload shape; normalize a few common variants.
  const anyOut = out as any;
  const candidates =
    anyOut?.results ??
    anyOut?.memories ??
    anyOut?.data ??
    anyOut?.out?.results ??
    anyOut?.out?.memories ??
    anyOut?.out?.data ??
    [];
  if (Array.isArray(candidates)) return candidates;
  return [];
}

export function useHindsight() {
  const [isReady, setIsReady] = useState(false);
  const [sessionsRemembered, setSessionsRemembered] = useState(0);
  const warnedRef = useRef(false);

  const init = useCallback(async () => {
    try {
      const res = await fetch("/api/memory/init", { method: "POST" });
      const json = await res.json().catch(() => ({}));
      const ok = Boolean(json?.ok);
      setIsReady(ok);
      return ok;
    } catch {
      setIsReady(false);
      return false;
    }
  }, []);

  const retain = useCallback(async ({ content, type }: { content: string; type?: string }) => {
    try {
      await fetch("/api/memory/retain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, type }),
      });
    } catch {
      if (!warnedRef.current) {
        warnedRef.current = true;
        console.warn("Hindsight memory offline. Continuing without persistence.");
      }
    }
  }, []);

  const recall = useCallback(async (query: string) => {
    try {
      const res = await fetch("/api/memory/recall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const json = await res.json().catch(() => ({}));
      if (!json?.ok) return [];
      const results = extractResults(json?.out ?? json);
      return results
        .map((r) => String((r as any)?.content ?? ""))
        .filter(Boolean)
        .slice(0, 5);
    } catch {
      if (!warnedRef.current) {
        warnedRef.current = true;
        console.warn("Hindsight memory offline. Continuing without persistence.");
      }
      return [];
    }
  }, []);

  const reflect = useCallback(async (query: string) => {
    try {
      const res = await fetch("/api/memory/reflect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const json = await res.json().catch(() => ({}));
      if (!json?.ok) return null;
      // normalize text
      const text =
        json?.out?.text ??
        json?.out?.result ??
        json?.out?.reflection ??
        json?.text ??
        null;
      return text ? String(text) : JSON.stringify(json.out ?? json);
    } catch {
      if (!warnedRef.current) {
        warnedRef.current = true;
        console.warn("Hindsight memory offline. Continuing without persistence.");
      }
      return null;
    }
  }, []);

  useEffect(() => {
    (async () => {
      const ok = await init();
      if (!ok) return;
      const results = await recall("completed sessions summary");
      const count = Math.min(99, results.length);
      setSessionsRemembered(count);
    })();
  }, [init, recall]);

  return useMemo(
    () => ({
      isReady,
      sessionsRemembered,
      retain,
      recall,
      reflect,
    }),
    [isReady, sessionsRemembered, retain, recall, reflect]
  );
}

